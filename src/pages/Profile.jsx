import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, Scale, Camera, Download, Upload, Trash2, Dumbbell,
  Calendar, BarChart3, AlertTriangle, Vibrate, Timer, Weight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { downloadJSON } from '../lib/utils';
import { createBackup, parseBackup, restoreBackup, wipeAllAppData } from '../lib/backup';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

export default function Profile() {
  const {
    workouts, routines, customExercises, measurements, photos,
    settings, updateSettings, reloadAll,
  } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState(null);
  const [toast, setToast] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const showMessage = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await createBackup();
      downloadJSON(data, `gymtracker-backup-${new Date().toISOString().split('T')[0]}.json`);
      showMessage('Backup exported successfully.');
    } catch (error) {
      console.error('Failed to export backup:', error);
      showMessage('Could not export your backup.', 'streak');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        parseBackup(parsed);
        setImportData(parsed);
        setShowImportModal(true);
      } catch (error) {
        console.error('Invalid backup file:', error);
        showMessage('That backup file is not valid.', 'streak');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = async () => {
    if (importData) {
      setIsImporting(true);
      try {
        await restoreBackup(importData);
        await reloadAll();
        setShowImportModal(false);
        setImportData(null);
        showMessage('Backup imported successfully.');
      } catch (error) {
        console.error('Failed to import backup:', error);
        showMessage('Could not import that backup.', 'streak');
      } finally {
        setIsImporting(false);
      }
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      await wipeAllAppData();
      await reloadAll();
      setShowClearModal(false);
      showMessage('All app data was cleared.');
    } catch (error) {
      console.error('Failed to clear app data:', error);
      showMessage('Could not clear app data.', 'streak');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <Calendar className="mx-auto text-brand-500 mb-1" size={18} />
          <div className="text-xl font-bold">{workouts.length}</div>
          <div className="text-[11px] text-gray-500">Workouts</div>
        </div>
        <div className="card text-center">
          <Dumbbell className="mx-auto text-purple-500 mb-1" size={18} />
          <div className="text-xl font-bold">{routines.length}</div>
          <div className="text-[11px] text-gray-500">Routines</div>
        </div>
        <div className="card text-center">
          <BarChart3 className="mx-auto text-green-500 mb-1" size={18} />
          <div className="text-xl font-bold">{customExercises.length}</div>
          <div className="text-[11px] text-gray-500">Custom Exercises</div>
        </div>
        <div className="card text-center">
          <Scale className="mx-auto text-orange-500 mb-1" size={18} />
          <div className="text-xl font-bold">{measurements.length}</div>
          <div className="text-[11px] text-gray-500">Measurements</div>
        </div>
      </div>

      {/* Preferences */}
      <div className="card space-y-4">
        <h3 className="font-bold text-sm">Preferences</h3>

        {/* Unit */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Weight size={16} className="text-gray-400" />
            <span className="text-sm">Weight Unit</span>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button
              onClick={() => updateSettings({ unit: 'lb', barWeight: 45 })}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${settings.unit === 'lb' ? 'bg-brand-500 text-white' : 'text-gray-500'}`}
              id="unit-lb"
            >lb</button>
            <button
              onClick={() => updateSettings({ unit: 'kg', barWeightKg: 20 })}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${settings.unit === 'kg' ? 'bg-brand-500 text-white' : 'text-gray-500'}`}
              id="unit-kg"
            >kg</button>
          </div>
        </div>

        {/* Dark mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.darkMode ? <Moon size={16} className="text-gray-400" /> : <Sun size={16} className="text-gray-400" />}
            <span className="text-sm">Dark Mode</span>
          </div>
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-brand-500' : 'bg-gray-300'}`}
              id="dark-mode-toggle"
              aria-label="Toggle dark mode"
              aria-checked={settings.darkMode}
              role="switch"
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
        </div>

        {/* Rest timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-gray-400" />
            <span className="text-sm">Rest Timer (sec)</span>
          </div>
          <input
            type="number"
            className="input-sm w-20"
            value={settings.defaultRestSeconds}
            onChange={(e) => updateSettings({ defaultRestSeconds: Number(e.target.value) })}
            id="rest-timer-setting"
          />
        </div>

        {/* Bar weight */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell size={16} className="text-gray-400" />
            <span className="text-sm">Bar Weight</span>
          </div>
          <input
            type="number"
            className="input-sm w-20"
            value={settings.unit === 'kg' ? settings.barWeightKg : settings.barWeight}
            onChange={(e) => {
              if (settings.unit === 'kg') {
                updateSettings({ barWeightKg: Number(e.target.value) });
              } else {
                updateSettings({ barWeight: Number(e.target.value) });
              }
            }}
            id="bar-weight-setting"
          />
        </div>

        {/* Vibrate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Vibrate size={16} className="text-gray-400" />
            <span className="text-sm">Vibrate on Rest End</span>
          </div>
            <button
              onClick={() => updateSettings({ vibrateOnRest: !settings.vibrateOnRest })}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.vibrateOnRest ? 'bg-brand-500' : 'bg-gray-300'}`}
              id="vibrate-toggle"
              aria-label="Toggle rest timer vibration"
              aria-checked={settings.vibrateOnRest}
              role="switch"
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${settings.vibrateOnRest ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
        </div>
      </div>

      {/* Tracking */}
      <div className="card space-y-2">
        <h3 className="font-bold text-sm mb-2">Tracking</h3>
        <button onClick={() => navigate('/measurements')} className="w-full flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition-colors" id="goto-measurements">
          <div className="flex items-center gap-2 text-sm"><Scale size={16} className="text-brand-500" /> Body Measurements</div>
          <span className="text-xs text-gray-400">{measurements.length} entries</span>
        </button>
        <button onClick={() => navigate('/photos')} className="w-full flex items-center justify-between py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 transition-colors" id="goto-photos">
          <div className="flex items-center gap-2 text-sm"><Camera size={16} className="text-brand-500" /> Progress Photos</div>
          <span className="text-xs text-gray-400">{photos.length} photos</span>
        </button>
      </div>

      {/* Data */}
      <div className="card space-y-2">
        <h3 className="font-bold text-sm mb-2">Data</h3>
        <button onClick={handleExport} className="btn-secondary w-full" id="export-data-btn" disabled={isExporting}>
          <Download size={16} /> {isExporting ? 'Exporting...' : 'Export All Data'}
        </button>
        <button onClick={() => fileRef.current?.click()} className="btn-secondary w-full" id="import-data-btn">
          <Upload size={16} /> Import Backup
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
        <button onClick={() => setShowClearModal(true)} className="btn-danger w-full" id="clear-data-btn">
          <Trash2 size={16} /> Clear All Data
        </button>
      </div>

      {/* Clear Confirmation */}
      <Modal isOpen={showClearModal} onClose={() => setShowClearModal(false)} title="Clear All Data" size="sm">
        <div className="flex items-start gap-2 mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">
            This will permanently delete ALL your data including workouts, routines, measurements, photos, and personal records. This cannot be undone!
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleClear} className="btn-danger flex-1" id="confirm-clear-data" disabled={isClearing}>
            {isClearing ? 'Clearing...' : 'Clear Everything'}
          </button>
          <button onClick={() => setShowClearModal(false)} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>

      {/* Import Confirmation */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Import Backup" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This will fully replace your existing data with the imported backup, including photos. Continue?
        </p>
        <div className="flex gap-2">
          <button onClick={confirmImport} className="btn-primary flex-1" id="confirm-import-data" disabled={isImporting}>
            {isImporting ? 'Importing...' : 'Import'}
          </button>
          <button onClick={() => setShowImportModal(false)} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
