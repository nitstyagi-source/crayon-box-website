"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon } from "lucide-react";

export default function AlumniAdminDashboard() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const supabase = createClient();

  useEffect(() => {
    fetchAlumni();
  }, []);

  async function fetchAlumni() {
    setLoading(true);
    const { data, error } = await supabase.from('alumni_network').select('*').order('order_index', { ascending: true });
    if (data) setAlumni(data);
    setLoading(false);
  }

  function startEdit(person: any) {
    setEditingId(person.id);
    setFormData({ ...person });
  }

  function startNew() {
    setEditingId('new');
    setFormData({ name: '', graduation_year: new Date().getFullYear(), current_role: '', company: '', quote: '', image_url: '', order_index: 0 });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({});
  }

  async function saveAlumni() {
    if (editingId === 'new') {
      await supabase.from('alumni_network').insert([formData]);
    } else {
      await supabase.from('alumni_network').update(formData).eq('id', editingId);
    }
    setEditingId(null);
    fetchAlumni();
  }

  async function deleteAlumni(id: string) {
    if (!confirm("Are you sure you want to delete this alumni record?")) return;
    await supabase.from('alumni_network').delete().eq('id', id);
    fetchAlumni();
  }

  if (loading) return <div className="p-12 text-center text-stone-500 animate-pulse">Loading Alumni Network...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">Alumni Network</h2>
          <p className="text-stone-500 font-light">Manage notable alumni success stories and testimonials.</p>
        </div>
        <button 
          onClick={startNew}
          className="bg-primary text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" /> Add Alumni
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-4 font-bold text-stone-600 text-sm uppercase tracking-wider">Photo</th>
              <th className="p-4 font-bold text-stone-600 text-sm uppercase tracking-wider">Alumni Details</th>
              <th className="p-4 font-bold text-stone-600 text-sm uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {editingId === 'new' && (
              <tr className="bg-blue-50/50">
                <td className="p-4" colSpan={3}>
                  <EditForm formData={formData} setFormData={setFormData} onSave={saveAlumni} onCancel={cancelEdit} />
                </td>
              </tr>
            )}
            
            {alumni.map(person => (
              <tr key={person.id} className="hover:bg-stone-50/50 transition-colors">
                {editingId === person.id ? (
                  <td className="p-4" colSpan={3}>
                    <EditForm formData={formData} setFormData={setFormData} onSave={saveAlumni} onCancel={cancelEdit} />
                  </td>
                ) : (
                  <>
                    <td className="p-4 w-24">
                      {person.image_url ? (
                        <img src={person.image_url} alt={person.name} className="w-16 h-16 rounded-full object-cover shadow-sm border border-stone-200" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-200">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-900 text-lg mb-1">{person.name} <span className="text-stone-400 font-normal text-sm ml-2">Class of {person.graduation_year}</span></div>
                      <div className="text-accent font-medium text-sm mb-1">{person.current_role} at {person.company}</div>
                      <div className="text-stone-500 text-xs italic line-clamp-1 border-l-2 border-stone-200 pl-2">"{person.quote}"</div>
                    </td>
                    <td className="p-4 text-right align-middle">
                      <button onClick={() => startEdit(person)} className="p-2 text-stone-400 hover:text-blue-600 transition-colors bg-white rounded-full hover:shadow-sm border border-transparent hover:border-stone-200 mr-2">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteAlumni(person.id)} className="p-2 text-stone-400 hover:text-red-600 transition-colors bg-white rounded-full hover:shadow-sm border border-transparent hover:border-stone-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            
            {alumni.length === 0 && editingId !== 'new' && (
              <tr>
                <td colSpan={3} className="p-12 text-center text-stone-500">
                  No alumni found. Click "Add Alumni" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditForm({ formData, setFormData, onSave, onCancel }: { formData: any, setFormData: any, onSave: () => void, onCancel: () => void }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Name</label>
          <input type="text" className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Graduation Year</label>
          <input type="number" className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.graduation_year || ''} onChange={e => setFormData({...formData, graduation_year: parseInt(e.target.value)})} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Current Role</label>
          <input type="text" className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.current_role || ''} onChange={e => setFormData({...formData, current_role: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Company</label>
          <input type="text" className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Image URL</label>
          <input type="text" className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Display Order</label>
          <input type="number" className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.order_index || 0} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Testimonial Quote</label>
          <textarea className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none h-20" value={formData.quote || ''} onChange={e => setFormData({...formData, quote: e.target.value})} />
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-full border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-colors flex items-center gap-2">
          <X className="w-4 h-4" /> Cancel
        </button>
        <button onClick={onSave} className="px-6 py-2 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Alumni
        </button>
      </div>
    </div>
  );
}
