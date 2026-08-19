"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, Video as VideoIcon } from "lucide-react";

export default function GalleryAdminDashboard() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const supabase = createClient();

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    setLoading(true);
    const { data } = await supabase.from('gallery_media').select('*').order('order_index', { ascending: true });
    if (data) setMedia(data);
    setLoading(false);
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setFormData({ ...item });
  }

  function startNew() {
    setEditingId('new');
    setFormData({ title: '', category: 'General', media_type: 'image', url: '', thumbnail_url: '', is_published: true, order_index: media.length });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({});
  }

  async function saveMedia() {
    if (editingId === 'new') {
      await supabase.from('gallery_media').insert([formData]);
    } else {
      await supabase.from('gallery_media').update(formData).eq('id', editingId);
    }
    setEditingId(null);
    fetchMedia();
  }

  async function deleteMedia(id: string) {
    if (!confirm("Are you sure you want to delete this media item?")) return;
    await supabase.from('gallery_media').delete().eq('id', id);
    fetchMedia();
  }

  if (loading) return <div className="p-12 text-center text-stone-500 animate-pulse">Loading Gallery...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Gallery Management</h1>
          <p className="text-stone-500">Manage images and videos shown in the school gallery.</p>
        </div>
        <button 
          onClick={startNew}
          disabled={editingId !== null}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-800 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" /> Add Media
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 text-sm uppercase tracking-widest">
              <th className="p-4 font-bold">Media</th>
              <th className="p-4 font-bold">Details</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {editingId === 'new' && (
              <tr className="bg-blue-50/50">
                <td colSpan={4} className="p-4">
                  <EditForm formData={formData} setFormData={setFormData} onSave={saveMedia} onCancel={cancelEdit} />
                </td>
              </tr>
            )}
            {media.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                {editingId === item.id ? (
                  <td colSpan={4} className="p-4 bg-blue-50/50">
                    <EditForm formData={formData} setFormData={setFormData} onSave={saveMedia} onCancel={cancelEdit} />
                  </td>
                ) : (
                  <>
                    <td className="p-4">
                      <div className="w-24 h-16 bg-stone-100 rounded-lg overflow-hidden flex items-center justify-center border border-stone-200 relative">
                        {item.media_type === 'video' ? (
                          <>
                            {item.thumbnail_url ? (
                              <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <VideoIcon className="w-6 h-6 text-stone-400" />
                            )}
                          </>
                        ) : (
                          <>
                            {item.url ? (
                              <img src={item.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-stone-400" />
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-900">{item.title}</div>
                      <div className="text-sm text-stone-500">{item.category} • {item.media_type}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-600'}`}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(item)} className="p-2 text-stone-400 hover:text-primary transition-colors">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteMedia(item.id)} className="p-2 text-stone-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {media.length === 0 && editingId !== 'new' && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-stone-500">
                  No media items found. Click "Add Media" to create one.
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
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 md:col-span-1">
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Title</label>
        <input 
          type="text" 
          value={formData.title || ''} 
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder="e.g. Annual Sports Day 2026"
        />
      </div>
      <div className="col-span-2 md:col-span-1">
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Category</label>
        <select 
          value={formData.category || 'General'} 
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="General">General</option>
          <option value="Sports & Athletics">Sports & Athletics</option>
          <option value="Arts & Culture">Arts & Culture</option>
          <option value="Academics & Labs">Academics & Labs</option>
          <option value="Campus Expansion Updates">Campus Expansion Updates</option>
        </select>
      </div>
      <div className="col-span-2 md:col-span-1">
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Media Type</label>
        <select 
          value={formData.media_type || 'image'} 
          onChange={(e) => setFormData({...formData, media_type: e.target.value})}
          className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="image">Image</option>
          <option value="video">Video (YouTube)</option>
        </select>
      </div>
      <div className="col-span-2 md:col-span-1">
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Media URL</label>
        <input 
          type="text" 
          value={formData.url || ''} 
          onChange={(e) => setFormData({...formData, url: e.target.value})}
          className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder={formData.media_type === 'video' ? 'e.g. https://www.youtube.com/embed/...' : 'e.g. https://images.unsplash.com/...'}
        />
      </div>
      {formData.media_type === 'video' && (
        <div className="col-span-2">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Thumbnail URL (Optional)</label>
          <input 
            type="text" 
            value={formData.thumbnail_url || ''} 
            onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
            className="w-full border border-stone-300 rounded-lg p-2 focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="e.g. https://images.unsplash.com/..."
          />
        </div>
      )}
      <div className="col-span-2 md:col-span-1 flex items-center gap-4 mt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={formData.is_published || false} 
            onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
            className="w-4 h-4 text-primary rounded border-stone-300 focus:ring-primary"
          />
          <span className="text-sm font-bold text-stone-700">Published</span>
        </label>
      </div>
      <div className="col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t border-stone-200">
        <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50">
          <X className="w-4 h-4" /> Cancel
        </button>
        <button onClick={onSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Save className="w-4 h-4" /> Save
        </button>
      </div>
    </div>
  );
}
