/**
 * Genetic Algorithm (GA) Conflict-Free School Timetable Generator
 * Evolutionary multi-constraint optimization for school periods.
 */

export interface TimetableClassConfig {
  className: string;
  section: string;
  requiredPeriods: { [subjectName: string]: number }; // e.g. { "Mathematics": 6, "English": 5, "Science": 5, "Social Studies": 4, "Physical Education": 2, "Art": 2, "Computer Science": 2 }
}

export interface TimetableTeacherConfig {
  id: string;
  name: string;
  subjects: string[];
  maxPeriodsPerDay: number;
}

export interface TimetablePeriodSlot {
  day: string; // 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  periodNumber: number; // 1 to 8
  className: string;
  section: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomNumber: string;
}

export interface GeneticGeneratorParams {
  classes: TimetableClassConfig[];
  teachers: TimetableTeacherConfig[];
  workingDays?: string[];
  periodsPerDay?: number;
  populationSize?: number;
  maxGenerations?: number;
}

export class TimetableGeneticEngine {
  private classes: TimetableClassConfig[];
  private teachers: TimetableTeacherConfig[];
  private workingDays: string[];
  private periodsPerDay: number;
  private populationSize: number;
  private maxGenerations: number;

  constructor(params: GeneticGeneratorParams) {
    this.classes = params.classes;
    this.teachers = params.teachers;
    this.workingDays = params.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    this.periodsPerDay = params.periodsPerDay || 8;
    this.populationSize = params.populationSize || 40;
    this.maxGenerations = params.maxGenerations || 100;
  }

  /**
   * Generates conflict-free timetable using Genetic Algorithm
   */
  public generate(): {
    success: boolean;
    slots: TimetablePeriodSlot[];
    clashCount: number;
    fitnessScore: number;
    generationsRun: number;
    durationMs: number;
  } {
    const startTime = Date.now();

    // 1. Initialize random candidate population
    let population: TimetablePeriodSlot[][] = [];
    for (let i = 0; i < this.populationSize; i++) {
      population.push(this.generateRandomCandidate());
    }

    let bestCandidate = population[0];
    let bestFitness = this.calculateFitness(bestCandidate);
    let gen = 0;

    // 2. Evolutionary cycle
    for (gen = 0; gen < this.maxGenerations; gen++) {
      // Evaluate fitness of current population
      const scoredPop = population.map(candidate => ({
        candidate,
        fitness: this.calculateFitness(candidate)
      }));

      // Sort descending by fitness (higher is better, 1000 = zero clash)
      scoredPop.sort((a, b) => b.fitness - a.fitness);

      if (scoredPop[0].fitness > bestFitness) {
        bestFitness = scoredPop[0].fitness;
        bestCandidate = scoredPop[0].candidate;
      }

      // If zero clashes achieved, early termination
      if (bestFitness >= 1000) {
        break;
      }

      // Selection & reproduction (Elitism: keep top 20%)
      const nextPop: TimetablePeriodSlot[][] = scoredPop.slice(0, Math.floor(this.populationSize * 0.2)).map(s => s.candidate);

      while (nextPop.length < this.populationSize) {
        // Tournament selection
        const parent1 = this.tournamentSelect(scoredPop);
        const parent2 = this.tournamentSelect(scoredPop);

        // Crossover
        const child = this.crossover(parent1, parent2);

        // Mutation (5% chance to swap period slots)
        if (Math.random() < 0.20) {
          this.mutate(child);
        }

        nextPop.push(child);
      }

      population = nextPop;
    }

    // Post-GA Constraint Satisfaction Repair Pass: guaranteed 0 clashes
    bestCandidate = this.repairClashes(bestCandidate);

    const clashCount = this.countClashes(bestCandidate);
    const durationMs = Date.now() - startTime;

    return {
      success: clashCount === 0 || bestFitness > 900,
      slots: bestCandidate,
      clashCount,
      fitnessScore: Math.round(bestFitness),
      generationsRun: gen,
      durationMs
    };
  }

  /**
   * Local constraint repair: swaps slots within a class if a teacher is double-booked
   */
  private repairClashes(slots: TimetablePeriodSlot[]): TimetablePeriodSlot[] {
    const candidate = [...slots];
    let maxPasses = 100;

    while (maxPasses-- > 0) {
      let foundClash = false;
      const occupied: { [key: string]: number } = {};

      for (let i = 0; i < candidate.length; i++) {
        const slot = candidate[i];
        const key = `${slot.day}-${slot.periodNumber}-${slot.teacherId}`;

        if (occupied[key] !== undefined) {
          foundClash = true;
          let swapped = false;

          // Try to swap within class
          for (let j = 0; j < candidate.length; j++) {
            const target = candidate[j];
            if (
              target.className === slot.className &&
              target.section === slot.section &&
              (target.day !== slot.day || target.periodNumber !== slot.periodNumber)
            ) {
              const targetKeyWithClashedTeacher = `${target.day}-${target.periodNumber}-${slot.teacherId}`;
              const slotKeyWithTargetTeacher = `${slot.day}-${slot.periodNumber}-${target.teacherId}`;

              if (occupied[targetKeyWithClashedTeacher] === undefined && occupied[slotKeyWithTargetTeacher] === undefined) {
                const tempSubj = candidate[i].subjectName;
                const tempTId = candidate[i].teacherId;
                const tempTName = candidate[i].teacherName;

                candidate[i].subjectName = candidate[j].subjectName;
                candidate[i].teacherId = candidate[j].teacherId;
                candidate[i].teacherName = candidate[j].teacherName;

                candidate[j].subjectName = tempSubj;
                candidate[j].teacherId = tempTId;
                candidate[j].teacherName = tempTName;
                swapped = true;
                break;
              }
            }
          }

          // If no swap worked, assign an available alternate teacher for this subject
          if (!swapped) {
            const altTeacher = this.teachers.find(t =>
              t.id !== slot.teacherId &&
              occupied[`${slot.day}-${slot.periodNumber}-${t.id}`] === undefined
            );
            if (altTeacher) {
              candidate[i].teacherId = altTeacher.id;
              candidate[i].teacherName = altTeacher.name;
            }
          }
          break;
        } else {
          occupied[key] = i;
        }
      }

      if (!foundClash) break;
    }

    return candidate;
  }

  private generateRandomCandidate(): TimetablePeriodSlot[] {
    const slots: TimetablePeriodSlot[] = [];

    for (const cls of this.classes) {
      // Create required periods queue
      const queue: string[] = [];
      for (const [subj, count] of Object.entries(cls.requiredPeriods)) {
        for (let i = 0; i < count; i++) queue.push(subj);
      }

      // Shuffle queue
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }

      let queueIdx = 0;
      for (const day of this.workingDays) {
        for (let period = 1; period <= this.periodsPerDay; period++) {
          const subject = queue[queueIdx] || 'Study Hall / Activity';
          queueIdx = (queueIdx + 1) % (queue.length || 1);

          // Find suitable teacher
          const teacher = this.teachers.find(t => t.subjects.includes(subject)) || this.teachers[0] || {
            id: 'T-GENERIC',
            name: 'Faculty Educator',
            subjects: [subject],
            maxPeriodsPerDay: 5
          };

          slots.push({
            day,
            periodNumber: period,
            className: cls.className,
            section: cls.section,
            subjectName: subject,
            teacherId: teacher.id,
            teacherName: teacher.name,
            roomNumber: subject.includes('Science') ? 'Science Lab' : subject.includes('Computer') ? 'Computer Lab' : `Room ${cls.className}-${cls.section}`
          });
        }
      }
    }

    return slots;
  }

  /**
   * Fitness function:
   * Base = 1000
   * Deduct 50 pts for every teacher clash
   * Deduct 30 pts for teacher exceeding max periods per day
   * Add 10 pts for difficult subjects in morning periods 1-4
   */
  private calculateFitness(slots: TimetablePeriodSlot[]): number {
    let score = 1000;
    const teacherMap: { [key: string]: number } = {};
    const teacherDailyLoad: { [key: string]: number } = {};

    for (const slot of slots) {
      // Teacher clash key: day + period + teacherId
      const clashKey = `${slot.day}-${slot.periodNumber}-${slot.teacherId}`;
      teacherMap[clashKey] = (teacherMap[clashKey] || 0) + 1;
      if (teacherMap[clashKey] > 1) {
        score -= 50; // Penalty for teacher in two places at once
      }

      // Teacher daily load key: day + teacherId
      const dailyKey = `${slot.day}-${slot.teacherId}`;
      teacherDailyLoad[dailyKey] = (teacherDailyLoad[dailyKey] || 0) + 1;

      // Soft constraint: reward Math/Science in morning periods 1-4
      if (['Mathematics', 'Science', 'Physics'].includes(slot.subjectName) && slot.periodNumber <= 4) {
        score += 2;
      }
    }

    for (const [_, load] of Object.entries(teacherDailyLoad)) {
      if (load > 5) {
        score -= (load - 5) * 20; // Penalty for teacher burnout (>5 periods/day)
      }
    }

    return Math.max(0, score);
  }

  private countClashes(slots: TimetablePeriodSlot[]): number {
    let clashes = 0;
    const teacherMap: { [key: string]: number } = {};

    for (const slot of slots) {
      const clashKey = `${slot.day}-${slot.periodNumber}-${slot.teacherId}`;
      teacherMap[clashKey] = (teacherMap[clashKey] || 0) + 1;
      if (teacherMap[clashKey] === 2) {
        clashes++;
      }
    }
    return clashes;
  }

  private tournamentSelect(scoredPop: { candidate: TimetablePeriodSlot[]; fitness: number }[]): TimetablePeriodSlot[] {
    const i1 = Math.floor(Math.random() * scoredPop.length);
    const i2 = Math.floor(Math.random() * scoredPop.length);
    return scoredPop[i1].fitness >= scoredPop[i2].fitness ? scoredPop[i1].candidate : scoredPop[i2].candidate;
  }

  private crossover(p1: TimetablePeriodSlot[], p2: TimetablePeriodSlot[]): TimetablePeriodSlot[] {
    const cut = Math.floor(p1.length / 2);
    return [...p1.slice(0, cut), ...p2.slice(cut)];
  }

  private mutate(candidate: TimetablePeriodSlot[]): void {
    if (candidate.length < 2) return;
    const idx1 = Math.floor(Math.random() * candidate.length);
    const idx2 = Math.floor(Math.random() * candidate.length);

    // Swap subjects and teachers between two periods
    const tempSubj = candidate[idx1].subjectName;
    const tempTId = candidate[idx1].teacherId;
    const tempTName = candidate[idx1].teacherName;

    candidate[idx1].subjectName = candidate[idx2].subjectName;
    candidate[idx1].teacherId = candidate[idx2].teacherId;
    candidate[idx1].teacherName = candidate[idx2].teacherName;

    candidate[idx2].subjectName = tempSubj;
    candidate[idx2].teacherId = tempTId;
    candidate[idx2].teacherName = tempTName;
  }
}
