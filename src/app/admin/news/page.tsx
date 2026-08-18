"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon } from "lucide-react";

export default function NewsAdminDashboard() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const supabase = createClient();

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    const { data, error } = await supabase.from('news_articles').select('*').order('published_date', { ascending: false });
    if (data) setArticles(data);
    setLoading(false);
  }

  function startEdit(article: any) {
    setEditingId(article.id);
    setFormData({ ...article });
  }

  function startNew() {
    setEditingId('new');
    setFormData({ title: '', slug: '', summary: '', content: '', category: 'News', image_url: '', is_published: false });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({});
  }

  async function saveArticle() {
    if (editingId === 'new') {
      await supabase.from('news_articles').insert([formData]);
    } else {
      await supabase.from('news_articles').update(formData).eq('id', editingId);
    }
    setEditingId(null);
    fetchArticles();
  }

  async function deleteArticle(id: string) {
    if (!confirm("Are you sure you want to delete this news article?")) return;
    await supabase.from('news_articles').delete().eq('id', id);
    fetchArticles();
  }

  if (loading) return <div className="p-12 text-center text-stone-500 animate-pulse">Loading News Articles...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">News & Updates</h2>
          <p className="text-stone-500 font-light">Manage announcements, events, and campus news.</p>
        </div>
        <button 
          onClick={startNew}
          className="bg-primary text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" /> Add Article
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="p-4 font-bold text-stone-600 text-sm uppercase tracking-wider">Image</th>
              <th className="p-4 font-bold text-stone-600 text-sm uppercase tracking-wider">Article Info</th>
              <th className="p-4 font-bold text-stone-600 text-sm uppercase tracking-wider">Status</th>
              <th className="p-4 font-bold text-stone-600 text-sm uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {editingId === 'new' && (
              <tr className="bg-blue-50/50">
                <td className="p-4" colSpan={4}>
                  <EditForm formData={formData} setFormData={setFormData} onSave={saveArticle} onCancel={cancelEdit} />
                </td>
              </tr>
            )}
            
            {articles.map(article => (
              <tr key={article.id} className="hover:bg-stone-50/50 transition-colors">
                {editingId === article.id ? (
                  <td className="p-4" colSpan={4}>
                    <EditForm formData={formData} setFormData={setFormData} onSave={saveArticle} onCancel={cancelEdit} />
                  </td>
                ) : (
                  <>
                    <td className="p-4 w-24">
                      {article.image_url ? (
                        <img src={article.image_url} alt={article.title} className="w-16 h-12 rounded-lg object-cover shadow-sm border border-stone-200" />
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 border border-stone-200">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-900 text-lg mb-1">{article.title}</div>
                      <div className="text-stone-500 text-xs mb-1 line-clamp-1">{article.summary}</div>
                      <div className="text-accent font-medium text-xs">
                        {article.category} • {article.published_date || new Date(article.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${article.is_published ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-600'}`}>
                        {article.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right align-middle">
                      <button onClick={() => startEdit(article)} className="p-2 text-stone-400 hover:text-blue-600 transition-colors bg-white rounded-full hover:shadow-sm border border-transparent hover:border-stone-200 mr-2">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteArticle(article.id)} className="p-2 text-stone-400 hover:text-red-600 transition-colors bg-white rounded-full hover:shadow-sm border border-transparent hover:border-stone-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            
            {articles.length === 0 && editingId !== 'new' && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-stone-500">
                  No news articles found. Click "Add Article" to create one.
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
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Title</label>
          <input type="text" className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-lg font-bold" value={formData.title || ''} onChange={e => {
            const title = e.target.value;
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            setFormData({...formData, title, slug});
          }} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">URL Slug</label>
          <input type="text" className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Category</label>
          <select className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.category || 'News'} onChange={e => setFormData({...formData, category: e.target.value})}>
            <option>News</option>
            <option>Events</option>
            <option>Achievements</option>
            <option>Campus Update</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Image URL</label>
          <input type="text" className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Summary (Short)</label>
          <textarea className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none h-16" value={formData.summary || ''} onChange={e => setFormData({...formData, summary: e.target.value})} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Full Content (Markdown/HTML)</label>
          <textarea className="w-full border border-stone-200 rounded-xl px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none h-48 font-mono text-sm" value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} />
        </div>
        <div>
          <label className="flex items-center gap-3 cursor-pointer p-4 border border-stone-200 rounded-xl hover:bg-stone-50">
            <input type="checkbox" className="w-5 h-5 accent-green-600" checked={formData.is_published || false} onChange={e => setFormData({...formData, is_published: e.target.checked})} />
            <span className="font-bold text-stone-700">Publish Article Publicly</span>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-stone-100">
        <button onClick={onCancel} className="px-4 py-2 rounded-full border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-colors flex items-center gap-2">
          <X className="w-4 h-4" /> Cancel
        </button>
        <button onClick={onSave} className="px-6 py-2 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Article
        </button>
      </div>
    </div>
  );
}
