import { useState } from 'react';
import './Project.css';

export default function Projects() {
    const [categoryName, setCategoryName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState('#3B82F6');
    const [categories, setCategories] = useState([
        { id: 1, name: 'Development', description: 'Design display', color: '#3B82F6', todayTime: '0:00', totalTime: '0:00' },
        { id: 2, name: 'Design', description: 'Design display', color: '#8B5CF6', todayTime: '0:00.83', totalTime: '0:00.83' },
        { id: 3, name: 'Meetings', description: 'Design display', color: '#F59E0B', todayTime: '0:00', totalTime: '0:00' }
    ]);

    const handleAddCategory = () => {
        if (categoryName.trim()) {
            const newCategory = {
                id: Date.now(),
                name: categoryName,
                description: description || 'Design display',
                color: selectedColor,
                todayTime: '0:00',
                totalTime: '0:00'
            };
            setCategories([...categories, newCategory]);
            setCategoryName('');
            setDescription('');
            setSelectedColor('#3B82F6');
        }
    };

    const handleDeleteCategory = (id:number) => {
        setCategories(categories.filter(cat => cat.id !== id));
    };

    return (
        <section className="container">
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

                <button className="add-button" onClick={handleAddCategory}>
                    + Add Category
                </button>
            </section>

            <section className="categories-section">
                <h4 className="section-title">Your Categories</h4>
                <p className="section-subtitle">Manage your time tracking categories</p>
                
                <ul className="categories-list">
                    {categories.map((category) => (
                        <li key={category.id} className="category-item">
                            <section className="category-content">
                                <section className="category-header">
                                    <section className="category-icon" style={{ backgroundColor: category.color }}></section>
                                    <section className="category-info">
                                        <h5 className="category-name">{category.name}</h5>
                                        <p className="category-description">{category.description}</p>
                                    </section>
                                </section>
                                <section className="category-times">
                                    <section className="time-block">
                                        <p className="time-label">Today</p>
                                        <p className="time-value">{category.todayTime}</p>
                                    </section>
                                    <section className="time-block">
                                        <p className="time-label">Total</p>
                                        <p className="time-value">{category.totalTime}</p>
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
            </section>
        </section>
    );
}