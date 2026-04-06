import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { MUSCLE_GROUPS, EQUIPMENT_TYPES } from '../lib/utils';

export default function ExercisePicker({ isOpen, onClose, onSelect }) {
  const { getAllExercises, addCustomExercise } = useApp();
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [equipFilter, setEquipFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState('Chest');
  const [newEquip, setNewEquip] = useState('Barbell');

  const exercises = getAllExercises();

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (muscleFilter && ex.muscle !== muscleFilter) return false;
      if (equipFilter && ex.equipment !== equipFilter) return false;
      return true;
    });
  }, [exercises, search, muscleFilter, equipFilter]);

  const handleSelect = (ex) => {
    onSelect(ex.id);
    setSearch('');
    setMuscleFilter('');
    setEquipFilter('');
    onClose();
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const ex = addCustomExercise({ name: newName.trim(), muscle: newMuscle, equipment: newEquip });
    onSelect(ex.id);
    setShowCreate(false);
    setNewName('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Exercise" size="lg">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="exercise-search-input"
        />
      </div>

      {/* Filter toggles */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost text-xs gap-1" id="exercise-filter-toggle">
          <Filter size={14} />
          Filters
        </button>
        {muscleFilter && (
          <span className="text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-2 py-1 rounded-full cursor-pointer" onClick={() => setMuscleFilter('')}>
            {muscleFilter} ×
          </span>
        )}
        {equipFilter && (
          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full cursor-pointer" onClick={() => setEquipFilter('')}>
            {equipFilter} ×
          </span>
        )}
      </div>

      {showFilters && (
        <div className="mb-3 space-y-2">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Muscle Group</label>
            <div className="flex flex-wrap gap-1.5">
              {MUSCLE_GROUPS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMuscleFilter(muscleFilter === m ? '' : m)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${muscleFilter === m ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Equipment</label>
            <div className="flex flex-wrap gap-1.5">
              {EQUIPMENT_TYPES.map((e) => (
                <button
                  key={e}
                  onClick={() => setEquipFilter(equipFilter === e ? '' : e)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors ${equipFilter === e ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exercise list */}
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {filtered.map((ex) => (
          <button
            key={ex.id}
            onClick={() => handleSelect(ex)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
            id={`exercise-option-${ex.id}`}
          >
            <div>
              <div className="font-medium text-sm">{ex.name}</div>
              <div className="text-xs text-gray-500">{ex.muscle} · {ex.equipment}</div>
            </div>
            {ex.isCustom && (
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">Custom</span>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No exercises found</p>
        )}
      </div>

      {/* Divider + Create */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
        {!showCreate ? (
          <button onClick={() => setShowCreate(true)} className="btn-ghost w-full text-brand-500" id="create-exercise-btn">
            <Plus size={16} /> Create Custom Exercise
          </button>
        ) : (
          <div className="space-y-3">
            <input className="input" placeholder="Exercise name" value={newName} onChange={(e) => setNewName(e.target.value)} id="new-exercise-name" />
            <div className="grid grid-cols-2 gap-2">
              <select className="input" value={newMuscle} onChange={(e) => setNewMuscle(e.target.value)} id="new-exercise-muscle">
                {MUSCLE_GROUPS.map((m) => <option key={m}>{m}</option>)}
              </select>
              <select className="input" value={newEquip} onChange={(e) => setNewEquip(e.target.value)} id="new-exercise-equipment">
                {EQUIPMENT_TYPES.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="btn-primary flex-1" id="save-custom-exercise-btn">Add</button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary" id="cancel-custom-exercise-btn">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
