import React from 'react';
import { Category } from '../types/product';
import { Grid, LayoutGrid, Layers, Filter } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  viewMode: 'collage' | 'grid' | 'aplus';
  setViewMode: (mode: 'collage' | 'grid' | 'aplus') => void;
  totalProductsCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  viewMode,
  setViewMode,
  totalProductsCount
}) => {
  return (
    <div className="category-section">
      <div className="container category-bar">
        {/* Category Chips */}
        <div className="category-chips-scroll">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`category-chip ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                <span>{cat.name}</span>
                {isActive && <span className="chip-badge">{totalProductsCount}</span>}
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        <div className="view-mode-switcher">
          <span className="switcher-label">
            <Filter size={14} /> Vista:
          </span>

          <button
            className={`view-btn ${viewMode === 'collage' ? 'active' : ''}`}
            onClick={() => setViewMode('collage')}
            title="Vista Collage Lookbook (Inspirada en A+)"
          >
            <Layers size={16} />
            <span>Collage A+</span>
          </button>

          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vista Grilla Regular"
          >
            <Grid size={16} />
            <span>Grilla</span>
          </button>

          <button
            className={`view-btn ${viewMode === 'aplus' ? 'active' : ''}`}
            onClick={() => setViewMode('aplus')}
            title="Vista Editorial A+ Content"
          >
            <LayoutGrid size={16} />
            <span>Editorial</span>
          </button>
        </div>
      </div>

      <style>{`
        .category-section {
          margin: 30px 0 24px 0;
        }

        .category-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
          flex-wrap: wrap;
        }

        .category-chips-scroll {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }

        .category-chips-scroll::-webkit-scrollbar {
          display: none;
        }

        .category-chip {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-dark);
          font-weight: 500;
          font-size: 0.88rem;
          padding: 8px 18px;
          border-radius: var(--border-radius-pill);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all var(--transition-fast);
        }

        .category-chip:hover {
          border-color: var(--text-dark);
          background-color: #ffffff;
        }

        .category-chip.active {
          background-color: var(--text-dark);
          color: #ffffff;
          border-color: var(--text-dark);
          box-shadow: var(--shadow-sm);
        }

        .chip-badge {
          background-color: rgba(255, 255, 255, 0.25);
          font-size: 0.75rem;
          padding: 1px 7px;
          border-radius: 10px;
          font-weight: 700;
        }

        .view-mode-switcher {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: var(--bg-card);
          padding: 4px;
          border-radius: var(--border-radius-pill);
          border: 1px solid var(--border-color);
        }

        .switcher-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin: 0 8px 0 10px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: var(--border-radius-pill);
          color: var(--text-muted);
          transition: all var(--transition-fast);
        }

        .view-btn:hover {
          color: var(--text-dark);
        }

        .view-btn.active {
          background-color: var(--bg-main);
          color: var(--text-dark);
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }

        @media (max-width: 768px) {
          .category-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .view-mode-switcher {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};
