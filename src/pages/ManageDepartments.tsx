import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, ArrowLeft, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Department {
    id: string;
    name: string;
    created_at: string;
}

export const ManageDepartments: React.FC = () => {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .order('name');

            if (error) throw error;
            setDepartments(data || []);
        } catch (error: any) {
            console.error('Error fetching departments:', error);
            setMessage({ type: 'error', text: 'Erro ao carregar setores' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddDepartment = async () => {
        if (!newDepartmentName.trim()) {
            setMessage({ type: 'error', text: 'Digite o nome do setor' });
            return;
        }

        try {
            const { error } = await supabase
                .from('departments')
                .insert([{ name: newDepartmentName.trim() }]);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Setor adicionado com sucesso!' });
            toast.success('Setor adicionado com sucesso!');
            setNewDepartmentName('');
            setShowAddModal(false);
            fetchDepartments();
        } catch (error: any) {
            console.error('Error adding department:', error);
            setMessage({ type: 'error', text: error.message || 'Erro ao adicionar setor' });
        }
    };

    const handleEditDepartment = async () => {
        if (!editingDepartment || !editingDepartment.name.trim()) {
            setMessage({ type: 'error', text: 'Digite o nome do setor' });
            return;
        }

        try {
            const { error } = await supabase
                .from('departments')
                .update({ name: editingDepartment.name.trim() })
                .eq('id', editingDepartment.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Setor atualizado com sucesso!' });
            toast.success('Setor atualizado com sucesso!');
            setEditingDepartment(null);
            setShowEditModal(false);
            fetchDepartments();
        } catch (error: any) {
            console.error('Error updating department:', error);
            setMessage({ type: 'error', text: error.message || 'Erro ao atualizar setor' });
        }
    };

    const handleDeleteDepartment = async (departmentId: string, departmentName: string) => {
        if (!confirm(`Tem certeza que deseja excluir o setor "${departmentName}"?\n\nAtenção: Os usuários deste setor não serão excluídos, mas ficarão sem setor atribuído.`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('departments')
                .delete()
                .eq('id', departmentId);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Setor excluído com sucesso!' });
            toast.success('Setor excluído com sucesso!');
            fetchDepartments();
        } catch (error: any) {
            console.error('Error deleting department:', error);
            setMessage({ type: 'error', text: error.message || 'Erro ao excluir setor' });
        }
    };

    const openEditModal = (department: Department) => {
        setEditingDepartment({ ...department });
        setShowEditModal(true);
    };

    if (loading) {
        return <div className="text-center text-white py-20">Carregando...</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Voltar ao Dashboard
            </button>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Building2 size={32} className="text-primary" />
                        <h2 className="text-3xl font-bold text-white">Gerenciar Setores</h2>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                        Adicionar Setor
                    </button>
                </div>

                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-500/20 border border-green-500 text-green-300'
                            : 'bg-red-500/20 border border-red-500 text-red-300'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="space-y-3">
                    {departments.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">Nenhum setor cadastrado.</p>
                    ) : (
                        departments.map(department => (
                            <div
                                key={department.id}
                                className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center justify-between hover:border-slate-600 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Building2 size={20} className="text-gray-400" />
                                    <span className="text-white font-medium">{department.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(department)}
                                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded transition-colors"
                                        title="Editar setor"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDepartment(department.id, department.name)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded transition-colors"
                                        title="Excluir setor"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal Adicionar Setor */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white">Adicionar Setor</h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewDepartmentName('');
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome do Setor
                                </label>
                                <input
                                    type="text"
                                    value={newDepartmentName}
                                    onChange={(e) => setNewDepartmentName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                    placeholder="Ex: Marketing"
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={handleAddDepartment}
                                className="w-full bg-primary hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Setor */}
            {showEditModal && editingDepartment && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white">Editar Setor</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingDepartment(null);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nome do Setor
                                </label>
                                <input
                                    type="text"
                                    value={editingDepartment.name}
                                    onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={handleEditDepartment}
                                className="w-full bg-primary hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
