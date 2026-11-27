import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Shield, User, Phone, FileText, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Player, PlayerPosition } from '../types';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerToEdit?: Player | null;
  onSavePlayer: (player: Player) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
];

const POSITIONS: { value: PlayerPosition; label: string; line: string }[] = [
  { value: 'POR', label: 'Portero (Arquero)', line: 'Portería' },
  { value: 'DFC', label: 'Defensa Central', line: 'Defensa' },
  { value: 'LI', label: 'Lateral Izquierdo', line: 'Defensa' },
  { value: 'LD', label: 'Lateral Derecho', line: 'Defensa' },
  { value: 'MCD', label: 'Mediocampista Defensivo', line: 'Mediocampo' },
  { value: 'MC', label: 'Mediocampista Central', line: 'Mediocampo' },
  { value: 'MCO', label: 'Mediocampista Ofensivo', line: 'Mediocampo' },
  { value: 'EI', label: 'Extremo Izquierdo', line: 'Delantera' },
  { value: 'ED', label: 'Extremo Derecho', line: 'Delantera' },
  { value: 'DC', label: 'Delantero Centro', line: 'Delantera' },
];

export const PlayerModal: React.FC<PlayerModalProps> = ({
  isOpen,
  onClose,
  playerToEdit,
  onSavePlayer,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [nombre, setNombre] = useState(playerToEdit?.nombre || '');
  const [cedula, setCedula] = useState(playerToEdit?.cedula || '');
  const [telefono, setTelefono] = useState(playerToEdit?.telefono || '');
  const [posicion, setPosicion] = useState<PlayerPosition>(playerToEdit?.posicion || 'DC');
  const [posicionSecundaria, setPosicionSecundaria] = useState<PlayerPosition | undefined>(
    playerToEdit?.posicionSecundaria
  );
  const [dorsal, setDorsal] = useState<number>(playerToEdit?.dorsal || 10);
  const [foto, setFoto] = useState(
    playerToEdit?.foto || PRESET_AVATARS[0]
  );
  const [status, setStatus] = useState<'activo' | 'inactivo'>(
    playerToEdit?.status || 'activo'
  );
  const [piernaHabil, setPiernaHabil] = useState<'Derecha' | 'Izquierda' | 'Ambidiestro'>(
    playerToEdit?.piernaHabil || 'Derecha'
  );
  const [apodo, setApodo] = useState(playerToEdit?.apodo || '');
  const [notas, setNotas] = useState(playerToEdit?.notas || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Live Camera state
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');

  // Stop camera tracks cleanly
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Start in-app webcam stream
  const handleStartLiveCamera = async () => {
    setErrorMsg('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback to mobile camera input
        cameraInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsLiveCameraActive(true);

      // Link video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      console.warn('Live camera error, opening device camera fallback:', err);
      // If permission denied or camera not supported, trigger native device camera input
      cameraInputRef.current?.click();
    }
  };

  // Flip camera between front and back
  const handleToggleCameraFacing = async () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    stopCameraStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: nextFacing,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setIsLiveCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err) {
      console.warn('Failed to switch camera', err);
    }
  };

  // Capture snapshot from live stream
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const vW = (video.videoWidth && video.videoWidth > 0) ? video.videoWidth : 480;
    const vH = (video.videoHeight && video.videoHeight > 0) ? video.videoHeight : 480;
    const size = Math.min(vW, vH) || 300;
    
    // 200x200 square avatar is crisp and tiny in bytes (~10-15KB)
    canvas.width = 200;
    canvas.height = 200;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      const startX = Math.max(0, (vW - size) / 2);
      const startY = Math.max(0, (vH - size) / 2);
      ctx.drawImage(video, startX, startY, size, size, 0, 0, 200, 200);

      const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
      setFoto(capturedDataUrl);
      setErrorMsg('');
      stopCameraStream();
    }
  };

  // Helper to compress any image file or camera snap using fast ObjectURL + Canvas
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      let objectUrl = '';
      try {
        objectUrl = URL.createObjectURL(file);
      } catch {
        objectUrl = '';
      }

      const finishWithCanvas = (sourceImg: CanvasImageSource, origW: number, origH: number) => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 220; // Perfect for 60-80px avatar, keeps base64 under 15KB
          let w = origW || 220;
          let h = origH || 220;
          if (w > h) {
            if (w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            }
          } else {
            if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(sourceImg, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.72);
            resolve(compressed);
          } else {
            resolve('');
          }
        } catch {
          resolve('');
        } finally {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        }
      };

      if (objectUrl) {
        const img = new Image();
        img.onload = () => finishWithCanvas(img, img.naturalWidth || img.width, img.naturalHeight || img.height);
        img.onerror = () => {
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          // Fallback to FileReader
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            const rawUrl = loadEvt.target?.result as string;
            if (!rawUrl) return resolve('');
            const fallbackImg = new Image();
            fallbackImg.onload = () => finishWithCanvas(fallbackImg, fallbackImg.width, fallbackImg.height);
            fallbackImg.onerror = () => resolve('');
            fallbackImg.src = rawUrl;
          };
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        };
        img.src = objectUrl;
      } else {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const rawUrl = loadEvt.target?.result as string;
          if (!rawUrl) return resolve('');
          const fallbackImg = new Image();
          fallbackImg.onload = () => finishWithCanvas(fallbackImg, fallbackImg.width, fallbackImg.height);
          fallbackImg.onerror = () => resolve('');
          fallbackImg.src = rawUrl;
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      }
    });
  };

  // Handle local file upload or device camera snap
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file);
      if (compressed) {
        setFoto(compressed);
        setErrorMsg('');
      } else {
        setErrorMsg('No se pudo procesar la imagen seleccionada.');
      }
    } catch {
      setErrorMsg('No se pudo procesar la foto.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let photoToSave = foto.trim();

    // If live camera is still open when clicking submit, auto-capture frame
    if (isLiveCameraActive && videoRef.current) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        const vW = (video.videoWidth && video.videoWidth > 0) ? video.videoWidth : 480;
        const vH = (video.videoHeight && video.videoHeight > 0) ? video.videoHeight : 480;
        const size = Math.min(vW, vH) || 300;
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const startX = Math.max(0, (vW - size) / 2);
          const startY = Math.max(0, (vH - size) / 2);
          ctx.drawImage(video, startX, startY, size, size, 0, 0, 200, 200);
          photoToSave = canvas.toDataURL('image/jpeg', 0.75);
        }
      } catch (err) {
        console.warn('Auto capture snapshot error', err);
      }
      stopCameraStream();
    }

    if (!nombre.trim()) {
      setErrorMsg('El nombre completo es obligatorio.');
      return;
    }

    stopCameraStream();

    const fallbackCedula = cedula.trim() || `ID-${Date.now().toString().slice(-6)}`;
    const fallbackTelefono = telefono.trim() || 'No especificado';

    const newPlayer: Player = {
      id: playerToEdit ? playerToEdit.id : `p-${Date.now()}`,
      nombre: nombre.trim(),
      cedula: fallbackCedula,
      telefono: fallbackTelefono,
      posicion,
      posicionSecundaria: posicionSecundaria || undefined,
      dorsal: Number(dorsal) || 0,
      foto: photoToSave || PRESET_AVATARS[0],
      status,
      piernaHabil,
      apodo: apodo.trim() || undefined,
      notas: notas.trim() || undefined,
    };

    onSavePlayer(newPlayer);
    onClose();
  };

  const handleCloseModal = () => {
    stopCameraStream();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {playerToEdit ? 'Editar Jugador' : 'Nuevo Jugador'}
            </span>
            <h2 className="font-display font-black text-slate-900 text-xl mt-1.5">
              {playerToEdit ? `Modificar Ficha: ${playerToEdit.nombre}` : 'Registrar en PF SOCCER'}
            </h2>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          
          {/* Photo Section */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              capture="user"
              className="hidden"
            />

            {/* Live Camera Viewfinder if active */}
            {isLiveCameraActive ? (
              <div className="bg-slate-900 rounded-2xl p-3 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Cámara Activa (Encuadra el rostro)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleCameraFacing}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-200"
                      title="Girar Cámara"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={stopCameraStream}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-200"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="relative w-full aspect-square max-w-[260px] mx-auto rounded-2xl overflow-hidden bg-black border border-slate-700">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle target circle guide */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-white/40 rounded-full m-6" />
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCaptureSnapshot}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>¡Tomar Foto Ahora!</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 border-slate-200 shadow-sm shrink-0">
                  <img
                    src={foto}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {foto.startsWith('data:image') && (
                    <span className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Foto de Perfil del Jugador
                      </span>
                      {foto.startsWith('data:image') && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Foto lista
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Tómate una foto con la cámara o sube una imagen desde tu móvil.
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={handleStartLiveCamera}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Tomar Foto con Cámara</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Subir de Archivos</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Presets */}
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                O selecciona un avatar rápido de la escuela:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFoto(url)}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 shrink-0 transition-transform ${
                      foto === url
                        ? 'border-emerald-600 scale-105 shadow-xs'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Preset ${idx}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name & Cedula */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Mateo Restrepo"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cédula / Documento <span className="font-normal text-slate-400">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej: 1020456789"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Phone & Apodo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teléfono / WhatsApp <span className="font-normal text-slate-400">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej: +57 312 456 7890"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Apodo Deportivo <span className="font-normal text-slate-400">(Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej: El Tigre, Rayo, Muralla..."
                value={apodo}
                onChange={(e) => setApodo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Position, Dorsal & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Posición Principal *
              </label>
              <select
                value={posicion}
                onChange={(e) => setPosicion(e.target.value as PlayerPosition)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.value} - {pos.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dorsal (Número) *
              </label>
              <input
                type="number"
                min={1}
                max={99}
                required
                value={dorsal}
                onChange={(e) => setDorsal(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estado en Escuela *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'activo' | 'inactivo')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="activo">Activo (Disponible)</option>
                <option value="inactivo">Inactivo (Lesión / Baja)</option>
              </select>
            </div>
          </div>

          {/* Pierna Habil */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pierna Hábil
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Derecha', 'Izquierda', 'Ambidiestro'] as const).map((leg) => (
                <button
                  key={leg}
                  type="button"
                  onClick={() => setPiernaHabil(leg)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    piernaHabil === leg
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {leg}
                </button>
              ))}
            </div>
          </div>

          {/* Error message directly above submit button */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{playerToEdit ? 'Actualizar Ficha' : 'Registrar Jugador'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
