import { useState, useEffect } from 'react';
import './Project.css';
import { createProject, deleteProject, getProjects } from '../../services/project.service';
import { isErrorDetail } from '@shared/types/utility.types';
import type { Project } from '@shared/types/project.types';
import ClockLoader from '../../components/ClockLoader/ClockLoader';

export default function Projects() {
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState('#3B82F6');
    const [categories, setCategories] = useState<Project[] | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setError(null);
        const result = await getProjects();
        
        if (isErrorDetail(result)) {
            setError(result.message);
            setCategories([]);
        } else {
            setCategories(result);
        }
    };

    const handleAddCategory = async () => {
        if (categoryName.trim()) {
            setIsAdding(true);
            setError(null);
            
            const result = await createProject(categoryName, selectedColor, description || undefined);
            
            if (isErrorDetail(result)) {
                setError(result.message);
            } else {
                setCategories([...(categories || []), result]);
                setCategoryName('');
                setDescription('');
                setSelectedColor('#3B82F6');
            }
            setIsAdding(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        setError(null);
        const result = await deleteProject(id);
        
        if (isErrorDetail(result)) {
            setError(result.message);
        } else {
            setCategories((categories || []).filter(cat => cat.id !== id));
        }
    };

    return (
        <section className="container">
            {error && (
                <div className="error-banner">
                    {error}
                    <button onClick={() => setError(null)}>✕</button>
                </div>
            )}
            
            <section className="add-category-section">
                <h4 className="section-title">Add Category</h4>
                <p className="section-subtitle">Create a new time tracking category</p>
                
                <article className="form-group">
                    <label className="form-label">Category Name</label>
                    <input 
                        type="text" 
                        className="form-input"
                        placeholder="e.g., Development, Design, Meetings"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                </article>

                <article className="form-group">
                    <label className="form-label">Description (optional)</label>
                    <input 
                        type="text" 
                        className="form-input"
                        placeholder="Brief description of this category"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </article>

                <article className="form-group">
                    <label className="form-label">Color</label>
                    <input 
                        type="color" 
                        className="color-picker"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                    />
                </article>

                <button className="add-button" onClick={handleAddCategory} disabled={isAdding}>
                    {isAdding ? 'Adding...' : '+ Add Category'}
                </button>
            </section>

            <section className="categories-section">
                <h4 className="section-title">Your Categories</h4>
                <p className="section-subtitle">Manage your time tracking categories</p>
                
                {categories === null ? (
                    <div className="loading-state">
                        <ClockLoader></ClockLoader>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="empty-state">
                        <p>No projects yet. Create your first one above!</p>
                    </div>
                ) : (
                    <ul className="categories-list">
                        {categories.map((category) => (
                            <li key={category.id} className="category-item">
                                <section className="category-content">
                                    <section className="category-header">
                                        <section className="category-icon" style={{ backgroundColor: category.colorHex }}></section>
                                        <section className="category-info">
                                            <h5 className="category-name">{category.name}</h5>
                                            <p className="category-description">{category.description}</p>
                                        </section>
                                    </section>
                                    <section className="category-times">
                                        <section className="time-block">
                                            <p className="time-label">Today</p>
                                            <p className="time-value">0:00</p>
                                        </section>
                                        <section className="time-block">
                                            <p className="time-label">Total</p>
                                            <p className="time-value">0:00</p>
                                        </section>
                                    </section>
                                </section>
                                <button 
                                    className="delete-button"
                                    onClick={() => handleDeleteCategory(category.id)}
                                    aria-label="Delete category"
                                >
                                    🗑️
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </section>
    );
}