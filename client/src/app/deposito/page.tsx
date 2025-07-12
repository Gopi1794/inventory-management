"use client";

// Importaciones de hooks, componentes, íconos y utilidades
import {
  useGetProductosQuery,
  useCreateRackMutation,
  useGetRacksQuery,
  useDeleteRackMutation,
  useUpdateRackMutation,
} from "@/state/api";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import interact from "interactjs";
import {
  Move,
  Lock,
  Trash,
  Eye,
  QrCode,
  Building2,
  Package,
  PanelTopClose,
  FolderClosedIcon,
  ShieldCloseIcon,
} from "lucide-react";
import {
  Button,
  Drawer,
  Modal,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ButtonGroup,
  Divider,
  IconButton,
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import Rating from "../(components)/Rating";
import { SelectChangeEvent } from "@mui/material/Select";
import { PrismaTypes } from "@/types/prisma";
import {
  Rack as ApiRack,
  Floor as ApiFloor,
  ProductoUbicacion,
} from "@/state/api";
import RackDrawerContent from "../(components)/RackDrawerContent";

// Interfaces para los tipos de datos usados en el componente
interface RackData extends ApiRack {
  width: number;
  height: number;
}

interface Floor {
  id: number;
  rackId: number;
  name: string;
  level: number;
  ubicaciones: Ubicacion[];
}

interface Ubicacion {
  id: number;
  floorId: number;
  name: string;
  productos: ProductoData[];
}

interface ProductoData {
  id: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  categoria: string;
  proveedor: string;
  precio: number;
}

interface FloorInput {
  id: number;
  name: string;
  level: number;
}

interface RackModification {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RackInConstruction {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  floors: FloorInput[];
}

function Deposito() {
  // -------------------- ESTADOS PRINCIPALES --------------------
  // Estados para racks, pisos, zoom/pan, modo construcción, etc.
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    {
      producto: ProductoData;
      rackId: number;
      floorName: string;
      floorLevel: number;
    }[]
  >([]);
  const [racks, setRacks] = useState<RackData[]>([]);
  const [doors, setDoors] = useState<
    { x: number; y: number; visible: boolean }[]
  >([]);
  const [nextId, setNextId] = useState(1);
  const [nextId2, setNextId2] = useState(1);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [hoveredRackId, setHoveredRackId] = useState<number | null>(null);
  const [currentRackId, setCurrentRackId] = useState<number | null>(null);
  const [productoDetalle, setProductoDetalle] = useState<ProductoData | null>(
    null
  );
  const [isNewRackModalOpen, setIsNewRackModalOpen] = useState(false);
  const [newRackFloorsCount, setNewRackFloorsCount] = useState(1);
  const [newRackFloors, setNewRackFloors] = useState<FloorInput[]>([
    { id: 1, name: "Piso 1", level: 1 },
  ]);
  // Estados para zoom y pan
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isConstructionMode, setIsConstructionMode] = useState(false);
  const [modifiedRacks, setModifiedRacks] = useState<RackModification[]>([]);
  const [deletedRackIds, setDeletedRackIds] = useState<number[]>([]);
  const [rackInConstruction, setRackInConstruction] =
    useState<RackInConstruction | null>(null);
  const [open, setOpen] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [refetchAttempts, setRefetchAttempts] = useState(0);
  const MAX_REFETCH_ATTEMPTS = 3;
  // Nuevo estado para controlar la visibilidad de las herramientas
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [selectedFloors, setSelectedFloors] = useState<{
    [rackId: number]: number | null;
  }>({});

  // -------------------- REFERENCIAS --------------------
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const interactAppliedRef = useRef<Set<number>>(new Set());
  const prevConstructionModeRef = useRef<boolean | undefined>(undefined);

  // -------------------- QUERIES DE DATOS --------------------
  // Productos
  const {
    data: productos,
    isLoading: isProductosLoading,
    isError: isProductosError,
  } = useGetProductosQuery({
    searchTerm: "",
    page: 1,
    limit: 10,
    categoria: "",
    proveedor: "",
    precioMin: 0,
    precioMax: 999999,
  });

  // Racks
  const {
    data: racksData,
    isLoading: isRacksLoading,
    isError: isRacksError,
    refetch,
  } = useGetRacksQuery();

  // Mutaciones para crear y eliminar racks
  const [createRack] = useCreateRackMutation();
  const [deleteRackMutation] = useDeleteRackMutation();
  const [updateRack] = useUpdateRackMutation();

  // -------------------- IMPRESIÓN DE QR --------------------
  const handlePrint = useReactToPrint({
    content: () =>
      currentRackId !== null ? qrRefs.current[currentRackId] : null,
    documentTitle: `Etiqueta-Rack-${currentRackId ?? ""}`,
    pageStyle: `
      @page {
        size: 60mm 40mm;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .etiqueta {
          width: 60mm;
          height: 40mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
          font-size: 10pt;
        }
        .etiqueta p {
          margin: 2px 0;
        }
        .etiqueta canvas {
          margin-bottom: 4px;
        }
      }
    `,
  });

  // -------------------- CALLBACKS Y HANDLERS --------------------
  // Abrir/cerrar modal de ayuda
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  // Entrar/salir de modo construcción
  const enterConstructionMode = useCallback(() => {
    setIsConstructionMode(true);
    setModifiedRacks([]);
    setDeletedRackIds([]);
  }, []);

  const exitConstructionMode = useCallback(() => {
    setIsConstructionMode(false);
    setModifiedRacks([]);
    setDeletedRackIds([]);
  }, []);

  // Handler para cambiar el piso seleccionado de un rack
  const handleSelectFloor = useCallback((rackId: number, floorId: number) => {
    setSelectedFloors((prev) => ({ ...prev, [rackId]: floorId }));
  }, []);

  // -------------------- FUNCIONES AUXILIARES --------------------
  // Filtrar racks (por ahora retorna todos los racks)
  const filteredRacks = useMemo(() => racks, [racks]);

  // Toggle lock/unlock de un rack
  const toggleLock = useCallback((rackId: number) => {
    setRacks((prev) =>
      prev.map((rack) =>
        rack.id === rackId ? { ...rack, locked: !rack.locked } : rack
      )
    );
  }, []);

  // Eliminar un rack
  const deleteRack = useCallback(
    async (rackId: number) => {
      try {
        await deleteRackMutation(rackId).unwrap();
        setRacks((prev) => prev.filter((rack) => rack.id !== rackId));
        setDeletedRackIds((prev) => [...prev, rackId]);
      } catch (error) {
        console.error("Error al eliminar el rack:", error);
      }
    },
    [deleteRackMutation]
  );

  // Toggle drawer de un rack

  // Renderizar contenido del drawer
  const renderDrawerContent = useCallback(() => {
    if (!currentRackId) return null;

    const rack = racks.find((r) => r.id === currentRackId);
    if (!rack) return null;

    // Usa el estado global para el piso seleccionado
    const selectedFloor = selectedFloors[rack.id] ?? rack.floors[0]?.id ?? null;
    const floor = rack.floors?.find((f) => f.id === selectedFloor);

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Rack #{rack.id}
        </Typography>

        {/* Selector de piso */}
        {rack.floors && rack.floors.length > 0 && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Piso</InputLabel>
            <Select
              value={selectedFloor}
              label="Piso"
              onChange={(e) =>
                handleSelectFloor(rack.id, Number(e.target.value))
              }
            >
              {rack.floors.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name} (Nivel {f.level})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Productos del piso seleccionado */}
        {floor ? (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Productos en {floor.name}:
            </Typography>
            {floor.ubicaciones && floor.ubicaciones.length > 0 ? (
              <Box sx={{ pl: 2 }}>
                {floor.ubicaciones.map((ubicacion) => (
                  <Box key={ubicacion.id}>
                    <Typography variant="body2">
                      {ubicacion.producto.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cantidad: {ubicacion.cantidad}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                No hay productos en este piso
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Selecciona un piso para ver sus productos.
          </Typography>
        )}
      </Box>
    );
  }, [currentRackId, racks, selectedFloors, handleSelectFloor]);

  // Guardar cambios de construcción
  const saveConstructionChanges = useCallback(async () => {
    try {
      // Envía cada rack modificado al backend
      for (const mod of modifiedRacks) {
        await updateRack({
          id: mod.id,
          x: mod.x,
          y: mod.y,
          width: mod.width,
          height: mod.height,
        });
      }

      // Elimina los racks marcados para borrar
      for (const id of deletedRackIds) {
        await deleteRackMutation(id);
      }

      // Refresca los datos
      await refetch();

      // Limpia el modo construcción
      setModifiedRacks([]);
      setDeletedRackIds([]);
      setIsConstructionMode(false);
    } catch (error) {
      console.error("Error guardando cambios:", error);
    }
  }, [modifiedRacks, deletedRackIds, updateRack, deleteRackMutation, refetch]);

  // Registrar cambios en racks (drag/resize)
  const registerRackModification = useCallback(
    (rackId: number, changes: Partial<RackModification>) => {
      setModifiedRacks((prev) => {
        const existing = prev.find((r) => r.id === rackId);
        if (existing) {
          return prev.map((r) => (r.id === rackId ? { ...r, ...changes } : r));
        } else {
          const rack = racks.find((r) => r.id === rackId);
          if (!rack) return prev;
          return [
            ...prev,
            {
              id: rackId,
              x: changes.x ?? rack.x,
              y: changes.y ?? rack.y,
              width: changes.width ?? rack.width,
              height: changes.height ?? rack.height,
            },
          ];
        }
      });

      // Actualizar también el estado local de racks
      setRacks((prev) =>
        prev.map((rack) => {
          if (rack.id === rackId) {
            return {
              ...rack,
              ...changes,
            };
          }
          return rack;
        })
      );
    },
    [racks]
  );

  // -------------------- INTERACT.JS: DRAG Y RESIZE --------------------
  // Aplica drag y resize a un rack si está en modo construcción y no está bloqueado
  const applyInteractToElement = useCallback(
    (interactable: Interact.Interactable, rackId: number) => {
      console.log("🔧 applyInteractToElement llamado para rack:", rackId); // Debug log

      const rack = racks.find((r) => r.id === rackId);
      if (!rack) {
        console.log("❌ Rack no encontrado en el estado:", rackId); // Debug log
        return;
      }

      console.log("🔧 Rack encontrado:", rack); // Debug log
      console.log("🔧 Modo construcción:", isConstructionMode); // Debug log
      console.log("🔧 Rack bloqueado:", rack.locked); // Debug log

      // Limpiar configuración anterior
      interactable.unset();

      if (isConstructionMode && !rack.locked) {
        console.log("✅ Aplicando drag al rack:", rackId); // Debug log

        // Configuración simplificada y directa de drag
        interactable.draggable({
          inertia: false,
          autoScroll: false,
          listeners: {
            start(event) {
              console.log(
                "🎯 DRAG START - interact.js iniciado en rack:",
                rackId
              ); // Debug log
              event.target.style.zIndex = "1000";
            },
            move(event) {
              console.log(
                "🎯 DRAG MOVE - interact.js moviendo rack:",
                rackId,
                "dx:",
                event.dx,
                "dy:",
                event.dy
              ); // Debug log
              const target = event.target;
              const x =
                (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
              const y =
                (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

              target.style.transform = `translate(${x}px, ${y}px)`;
              target.setAttribute("data-x", x);
              target.setAttribute("data-y", y);

              registerRackModification(rackId, {
                x: Math.round(rack.x + x / scale),
                y: Math.round(rack.y + y / scale),
                width: rack.width,
                height: rack.height,
              });
            },
            end(event) {
              console.log(
                "🎯 DRAG END - interact.js terminado en rack:",
                rackId
              ); // Debug log
              event.target.style.zIndex = "auto";
            },
          },
        });

        console.log(
          "✅ Interact.js drag aplicado exitosamente al rack:",
          rackId
        ); // Debug log
      } else {
        console.log(
          "❌ No se aplica interact.js - Modo construcción:",
          isConstructionMode,
          "Rack bloqueado:",
          rack.locked
        ); // Debug log
        // Aplicar configuración básica sin drag
        interactable.draggable(false);
      }
    },
    [isConstructionMode, scale, registerRackModification, racks]
  );

  // Aplicar interact.js a un rack por id
  const applyInteract = useCallback(
    (id: string) => {
      const target = document.getElementById(id);
      if (!target) return;

      // Limpia cualquier configuración previa
      interact(target).unset();

      // Solo aplica si está en modo construcción y el rack no está locked
      const rackId = parseInt(id.replace("rack-", ""));
      const rack = racks.find((r) => r.id === rackId);
      if (!isConstructionMode || !rack || rack.locked) return;

      interact(target)
        .draggable({
          inertia: false,
          listeners: {
            move(event) {
              let x = (parseFloat(target.style.left) || 0) + event.dx / scale;
              let y = (parseFloat(target.style.top) || 0) + event.dy / scale;
              target.style.left = `${x}px`;
              target.style.top = `${y}px`;
              // Aquí actualiza el estado si lo necesitas
              registerRackModification(rackId, {
                x: Math.round(x),
                y: Math.round(y),
                width: parseFloat(target.style.width || "100"),
                height: parseFloat(target.style.height || "100"),
              });
            },
          },
        })
        .resizable({
          edges: { left: true, right: true, bottom: true, top: true },
          listeners: {
            move(event) {
              let { width, height } = event.rect;
              width = width / scale;
              height = height / scale;
              target.style.width = `${width}px`;
              target.style.height = `${height}px`;
              // Aquí actualiza el estado si lo necesitas
              registerRackModification(rackId, {
                width: Math.round(width),
                height: Math.round(height),
                x: parseFloat(target.style.left || "0"),
                y: parseFloat(target.style.top || "0"),
              });
            },
          },
        });
    },
    [isConstructionMode, racks, scale, registerRackModification]
  );

  // -------------------- HANDLERS DE INTERACCIÓN DEL CANVAS --------------------
  // Zoom, pan, mouse events
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // Prevenir el zoom del navegador
    e.preventDefault();
    e.stopPropagation();

    // Detectar si es un gesto de zoom (trackpad o Ctrl+wheel)
    const isZoomGesture = e.ctrlKey || e.metaKey || Math.abs(e.deltaY) < 50;

    if (isZoomGesture) {
      // Zoom
      const zoomIntensity = 0.1;
      const direction = e.deltaY > 0 ? -1 : 1;
      setScale((prev) =>
        Math.max(0.5, Math.min(3, prev + direction * zoomIntensity))
      );
    } else {
      // Pan
      setOffset((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    },
    [isDragging, lastMousePos]
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // Pan solo si el click es en el fondo (no sobre un rack)
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;

      // Si estamos en modo construcción, solo activar pan si el click NO es en un rack
      if (isConstructionMode) {
        const target = e.target as HTMLElement;
        const isRackClick = target.closest(".rack-container");

        if (isRackClick) {
          console.log(
            "🎯 Click en rack en modo construcción - permitiendo interact.js manejar el drag"
          );
          return; // No activar pan, dejar que interact.js maneje el drag
        }
      }

      // Solo activar pan si el click es en el fondo del canvas
      if (e.target === e.currentTarget) {
        console.log("🎯 Click en fondo del canvas - activando pan");
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    },
    [isConstructionMode]
  );

  // -------------------- MANEJO DE CREACIÓN DE RACKS --------------------
  const handleCreateRack = async () => {
    // Generar un ID temporal único para el nuevo rack
    const tempId = Date.now();

    // Crea los pisos según la cantidad indicada
    const floors: ApiFloor[] = Array.from(
      { length: newRackFloorsCount },
      (_, i) => ({
        id: i + 1,
        rackId: tempId,
        name: `Piso ${i + 1}`,
        level: i + 1,
        ubicaciones: [] as ProductoUbicacion[],
      })
    );

    try {
      const newRackData: Partial<ApiRack> = {
        x: 100,
        y: 100,
        locked: false,
        qrData: `Rack-${tempId}`,
        floors,
      };

      const newRack = await createRack(newRackData).unwrap();

      // Convertimos el rack de la API a nuestro tipo local que incluye width y height
      const rackWithDimensions: RackData = {
        ...newRack,
        width: 100, // Valores por defecto
        height: 100,
      };

      setRacks((prev) => [...prev, rackWithDimensions]);
      setNextId((prev) => prev + 1);
      setIsNewRackModalOpen(false);

      // Aplicar interact.js al nuevo rack después de que se renderice
      setTimeout(() => {
        const rackId = `rack-${newRack.id}`;
        applyInteract(rackId);
      }, 100);
    } catch (error) {
      console.error("Error al crear el rack:", error);
    }
  };

  // -------------------- RENDER --------------------
  useEffect(() => {
    if (racksData) {
      console.log("Racks cargados desde la API:", racksData); // Debug log
      const racksWithDimensions = racksData.map((rack) => ({
        ...rack,
        width: 100,
        height: 100,
        floors: rack.floors || [], // Aseguramos que floors siempre sea un array
      }));
      console.log("Racks procesados:", racksWithDimensions); // Debug log
      setRacks(racksWithDimensions);
    }
  }, [racksData]);

  // Aplicar interact.js a los racks cuando cambien
  useEffect(() => {
    console.log(
      "🔄 useEffect ejecutado - Racks actuales:",
      racks.map((r) => r.id)
    ); // Debug log
    console.log(
      "🔄 Racks con interact aplicado:",
      Array.from(interactAppliedRef.current)
    ); // Debug log
    console.log("🔄 Modo construcción activo:", isConstructionMode); // Debug log
    console.log(
      "🔄 Modo construcción anterior:",
      prevConstructionModeRef.current
    ); // Debug log

    // Limpiar interact.js de todos los racks cuando cambie el modo construcción
    if (
      prevConstructionModeRef.current !== undefined &&
      prevConstructionModeRef.current !== isConstructionMode
    ) {
      console.log(
        "🔄 Modo construcción cambió, limpiando interact.js de todos los racks"
      ); // Debug log
      racks.forEach((rack) => {
        const rackId = `rack-${rack.id}`;
        interact(rackId).unset();
      });
      interactAppliedRef.current.clear();
    }

    // Actualizar el ref del modo construcción anterior
    prevConstructionModeRef.current = isConstructionMode;

    // Aplicar interact.js a todos los racks después de un pequeño delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(() => {
      racks.forEach((rack) => {
        const rackId = `rack-${rack.id}`;
        console.log("🆕 Aplicando interact.js a rack:", rack.id); // Debug log
        applyInteract(rackId);
        interactAppliedRef.current.add(rack.id);
      });
    }, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isConstructionMode, racks, applyInteract]); // Solo dependencia del modo construcción

  // Efecto separado para aplicar interact.js cuando se agregan nuevos racks
  useEffect(() => {
    if (racks.length === 0) return;

    const timeoutId = setTimeout(() => {
      racks.forEach((rack) => {
        if (!interactAppliedRef.current.has(rack.id)) {
          const rackId = `rack-${rack.id}`;
          console.log("🆕 Aplicando interact.js a rack nuevo:", rack.id); // Debug log
          applyInteract(rackId);
          interactAppliedRef.current.add(rack.id);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [racks.length, applyInteract]); // Incluir applyInteract en las dependencias

  // Prevenir zoom del navegador
  useEffect(() => {
    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // Agregar event listener al documento
    document.addEventListener("wheel", preventZoom, { passive: false });

    // Limpiar al desmontar
    return () => {
      document.removeEventListener("wheel", preventZoom);
    };
  }, []);

  // Función de prueba para aplicar interact.js manualmente
  const testApplyInteract = useCallback(() => {
    console.log("🧪 Test: Aplicando interact.js manualmente a todos los racks");
    interactAppliedRef.current.clear();
    racks.forEach((rack) => {
      const rackId = `rack-${rack.id}`;
      console.log("🧪 Test: Aplicando a rack:", rackId);
      applyInteract(rackId);
      interactAppliedRef.current.add(rack.id);
    });
  }, [racks, applyInteract]);

  // Función de debug para verificar el estado de interact.js
  const debugInteractStatus = useCallback(() => {
    console.log("🔍 === DEBUG INTERACT.JS STATUS ===");
    console.log("🔍 Modo construcción:", isConstructionMode);
    console.log("🔍 Racks totales:", racks.length);
    console.log(
      "🔍 Racks con interact aplicado:",
      Array.from(interactAppliedRef.current)
    );

    racks.forEach((rack) => {
      const rackId = `rack-${rack.id}`;
      const element = document.getElementById(rackId);
      const interactable = interact(rackId);

      console.log(`🔍 Rack ${rack.id}:`);
      console.log(`  - Elemento existe:`, !!element);
      console.log(`  - Interactable existe:`, !!interactable);
      console.log(`  - Bloqueado:`, rack.locked);
      console.log(`  - En modo construcción:`, isConstructionMode);
      console.log(
        `  - Debería tener drag:`,
        isConstructionMode && !rack.locked
      );

      if (element) {
        console.log(`  - Transform:`, element.style.transform);
        console.log(`  - Cursor:`, element.style.cursor);
        console.log(`  - Z-index:`, element.style.zIndex);
        console.log(`  - Touch-action:`, element.style.touchAction);
        console.log(`  - User-select:`, element.style.userSelect);
      }

      if (interactable) {
        console.log(`  - Interactable configurado:`, !!interactable.draggable);
        console.log(
          `  - Interactable listeners:`,
          interactable.draggable().listeners
        );
      }
    });
    console.log("🔍 === FIN DEBUG ===");
  }, [racks, isConstructionMode]);

  return (
    <>
      {/* Estilos CSS para los controles */}
      <style jsx>{`
        /* Prevenir zoom del navegador */
        html,
        body {
          touch-action: none;
          -ms-touch-action: none;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Animación de pulso para el indicador de modo construcción */
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .fab-container {
          position: absolute;
          top: 100px;
          right: 24px;
          z-index: 10;
        }

        .fab-container-construction {
          position: absolute;
          top: 24px;
          right: 24px;
          z-index: 10;
        }

        .fab-main {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: white;
          font-size: 24px;
        }

        .fab-main:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
        }

        .fab-main.expanded {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          transform: rotate(45deg);
        }

        .fab-main-construction {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          border: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: white;
          font-size: 24px;
        }

        .fab-main-construction:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
        }

        .fab-main-construction.expanded {
          background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
          transform: rotate(45deg);
        }

        .fab-tools {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          flex-direction: row;
          gap: 12px;
          opacity: 0;
          visibility: hidden;
          transform: translateX(20px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fab-tools.expanded {
          opacity: 1;
          visibility: visible;
          transform: translateX(-80px);
        }

        .fab-tool {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: #333;
          backdrop-filter: blur(10px);
          position: relative;
        }

        .fab-tool:hover {
          transform: scale(1.1);
          background: rgba(255, 255, 255, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .fab-tool-label {
          position: absolute;
          right: 60px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          pointer-events: none;
          z-index: 1000;
        }

        .fab-tool:hover .fab-tool-label {
          opacity: 1;
          visibility: visible;
        }

        .zoom-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
        }

        .zoom-button {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.05);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #333;
        }

        .zoom-button:hover {
          background: rgba(0, 0, 0, 0.1);
          transform: scale(1.05);
        }

        .zoom-divider {
          width: 100%;
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          margin: 4px 0;
        }
      `}</style>

      {/* Área principal de trabajo */}
      <div
        onWheel={handleWheel}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          position: "relative",
          cursor: isDragging ? "grabbing" : "grab",
          background: "#2c2b2b",
          border: "1px solid #ffffff",
        }}
      >
        {/* Fondo cuadriculado blanco */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundSize: "32px 32px",
          }}
        />

        {/* FAB - Floating Action Button con herramientas */}
        <div className="fab-container">
          {/* Herramientas desplegables */}
          <div className={`fab-tools ${isToolsOpen ? "expanded" : ""}`}>
            {/* Botón Reset */}
            <button
              onClick={() => setScale(1)}
              className="fab-tool"
              title="Reset Zoom"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"
                  fill="currentColor"
                />
              </svg>
              <span className="fab-tool-label">Reset Zoom</span>
            </button>

            {/* Botón Centrar */}
            <button
              onClick={() => setOffset({ x: 0, y: 0 })}
              className="fab-tool"
              title="Centrar Vista"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20 12C20 7.58 16.42 4 12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12ZM12 20C9.33 20 7 17.67 7 15H5C5 18.86 8.14 22 12 22V20ZM12 4C14.67 4 17 6.33 17 9H19C19 5.14 15.86 2 12 2V4Z"
                  fill="currentColor"
                />
              </svg>
              <span className="fab-tool-label">Centrar Vista</span>
            </button>

            {/* Controles de Zoom */}
            <div className="zoom-controls">
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                className="zoom-button"
                title="Zoom Out"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13H5V11H19V13Z" fill="currentColor" />
                </svg>
              </button>
              <div className="zoom-divider" />
              <button
                onClick={() => setScale((s) => Math.min(3, s + 0.1))}
                className="zoom-button"
                title="Zoom In"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Botón principal FAB */}
          <button
            onClick={() => setIsToolsOpen(!isToolsOpen)}
            className={`fab-main ${isToolsOpen ? "expanded" : ""}`}
            title={isToolsOpen ? "Cerrar Herramientas" : "Abrir Herramientas"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* FAB para modo construcción */}
        <div className="fab-container-construction">
          {/* Herramientas de construcción desplegables */}
          <div className={`fab-tools ${isConstructionMode ? "expanded" : ""}`}>
            {/* Botón Agregar Rack */}
            <button
              onClick={() => setIsNewRackModalOpen(true)}
              className="fab-tool"
              title="Agregar Rack"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                  fill="currentColor"
                />
              </svg>
              <span className="fab-tool-label">Agregar Rack</span>
            </button>

            {/* Botón Guardar Cambios */}
            <button
              onClick={saveConstructionChanges}
              className="fab-tool"
              title="Guardar Cambios"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                  fill="currentColor"
                />
              </svg>
              <span className="fab-tool-label">Guardar Cambios</span>
            </button>

            {/* Botón Ayuda */}
            <button onClick={handleOpen} className="fab-tool" title="Ayuda">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
                  fill="currentColor"
                />
              </svg>
              <span className="fab-tool-label">Ayuda</span>
            </button>

            {/* Botón de Prueba */}
            <button
              onClick={testApplyInteract}
              className="fab-tool"
              title="Test Interact"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  fill="currentColor"
                />
              </svg>
              <span className="fab-tool-label">Test Interact</span>
            </button>

            {/* Botón Debug */}
            <button
              onClick={debugInteractStatus}
              className="fab-tool"
              title="Debug Status"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
                  fill="currentColor"
                />
              </svg>
              <span className="fab-tool-label">Debug Status</span>
            </button>

            {/* Botón Cancelar */}
            <button
              onClick={exitConstructionMode}
              className="fab-tool"
              title="Cancelar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  fill="currentColor"
                />
              </svg>
              <span className="fab-tool-label">Cancelar</span>
            </button>
          </div>

          {/* Botón principal FAB de construcción */}
          <button
            onClick={() => setIsConstructionMode(!isConstructionMode)}
            className={`fab-main-construction ${
              isConstructionMode ? "expanded" : ""
            }`}
            title={
              isConstructionMode
                ? "Salir Modo Construcción"
                : "Modo Construcción"
            }
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* Canvas de racks y cuadrícula */}
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            position: "absolute",
            top: 0,
            left: 0,
            width: "5000px", // Área de trabajo MUY grande
            height: "5000px",
            zIndex: 1,
            overflow: "visible",
            backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)
      `,
            backgroundSize: "32px 32px",
            pointerEvents: "auto", // En modo construcción, no capturar clicks
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Render de cada rack */}
          {filteredRacks.map((rack) => (
            <div
              key={rack.id}
              id={`rack-${rack.id}`}
              data-rack-id={rack.id}
              data-interactable="true"
              className="rack-container"
              onMouseEnter={() => setHoveredRackId(rack.id)}
              onMouseLeave={() => setHoveredRackId(null)}
              onClick={(e) => {
                console.log(
                  "🖱️ Click en rack:",
                  rack.id,
                  "Interact aplicado:",
                  interactAppliedRef.current.has(rack.id)
                );
                if (isConstructionMode && !rack.locked) {
                  e.stopPropagation(); // Prevenir que el canvas capture el evento
                }
              }}
              style={{
                width: `${rack.width}px`,
                height: `${rack.height}px`,
                position: "absolute",
                left: rack.x,
                top: rack.y,
                textAlign: "center",
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
                backgroundColor:
                  isConstructionMode && !rack.locked
                    ? "#ff9800"
                    : rack.locked
                    ? "#4cae40"
                    : "#4caf50",
                cursor: isConstructionMode && !rack.locked ? "move" : "default",
                userSelect: "none",
                touchAction: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                pointerEvents: "auto",
                borderRadius: "10px",
                transition: "transform 0.05s linear",
                border:
                  isConstructionMode && !rack.locked
                    ? "5px dashed #ff9800"
                    : "5px solid transparent",
                backgroundImage:
                  isConstructionMode && !rack.locked
                    ? "none"
                    : `
                linear-gradient(#4cae40, #4cae40),
                repeating-linear-gradient(
                  45deg,
                  red 0,
                  red 10px,
                  yellow 10px,
                  yellow 20px
                )
              `,
                backgroundOrigin: "border-box",
                backgroundClip: "content-box, border-box",

                opacity: isConstructionMode && !rack.locked ? 0.8 : 1,
                // Indicador visual de que interact.js está aplicado
                boxShadow: interactAppliedRef.current.has(rack.id)
                  ? "0 0 10px rgba(255, 255, 0, 0.8)"
                  : "none",
              }}
            >
              Rack {rack.id}
              {/* Botones de acción sobre el rack */}
              <AnimatePresence>
                {hoveredRackId === rack.id && (
                  <motion.div
                    key="rack-buttons"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      left: "0",
                      top: "0",
                      transform: "translateY(-50%)",
                      display: "flex",
                      padding: "5px",
                      borderRadius: "10px",
                      backgroundColor: "#fff",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    {isConstructionMode ? (
                      <>
                        <Button
                          variant="contained"
                          size="small"
                          style={{
                            backgroundColor: rack.locked ? "#ccc" : "#4cae40",
                          }}
                          onClick={() => toggleLock(rack.id)}
                        >
                          {rack.locked ? <Move /> : <Lock />}
                        </Button>

                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => deleteRack(rack.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setCurrentRackId(rack.id)}
                      >
                        <Eye size={16} />
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Indicador de modo construcción fijo */}
        {isConstructionMode && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              zIndex: 10,
              background: "rgba(76, 175, 79, 0.54)",
              color: "white",
              padding: "12px 20px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              minWidth: "280px",
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#fff",
                animation: "pulse 2s infinite",
              }}
            />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              <div style={{ fontSize: "16px", fontWeight: "700" }}>
                Modo Construcción Activo
              </div>
              <div
                style={{
                  fontSize: "12px",
                  opacity: 0.9,
                  display: "flex",
                  gap: "15px",
                }}
              >
                <span>📦 Moviendo/Redimensionando: {modifiedRacks.length}</span>
                <span>🗑️ Eliminados: {deletedRackIds.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drawer para ver detalles del rack */}
      <Drawer
        anchor="right"
        open={Boolean(currentRackId)}
        onClose={() => setCurrentRackId(null)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: "450px" },
            backgroundColor: "rgba(176, 176, 176, 0.38)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        {currentRackId && racks.find((r) => r.id === currentRackId) && (
          <RackDrawerContent
            rack={racks.find((r) => r.id === currentRackId)!}
          />
        )}
      </Drawer>

      {/* Modal de ayuda */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "600px",
            bgcolor: "#1f2225",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
          >
            Ayuda - Modo Construcción
          </Typography>

          <Typography id="modal-modal-description" sx={{ mb: 2 }}>
            En el modo construcción, puedes mover y redimensionar los racks
            arrastrándolos o usando las manijas en las esquinas. También puedes
            bloquear/desbloquear racks y eliminar racks existentes.
          </Typography>

          <Typography
            variant="subtitle1"
            component="h3"
            gutterBottom
            sx={{ mt: 2 }}
          >
            Controles:
          </Typography>
          <ul>
            <li>
              <strong>Agregar Rack:</strong> Crea un nuevo rack con la cantidad
              de pisos especificada.
            </li>
            <li>
              <strong>Guardar Cambios:</strong> Aplica los cambios realizados en
              la posición y tamaño de los racks.
            </li>
            <li>
              <strong>Cancelar:</strong> Cancela el modo construcción sin
              guardar cambios.
            </li>
            <li>
              <strong>Bloquear/Desbloquear:</strong> Previene que un rack sea
              movido o redimensionado.
            </li>
            <li>
              <strong>Eliminar:</strong> Elimina un rack existente.
            </li>
          </ul>

          <Typography
            variant="subtitle1"
            component="h3"
            gutterBottom
            sx={{ mt: 2 }}
          >
            Notas:
          </Typography>
          <ul>
            <li>
              Asegúrate de guardar los cambios antes de salir del modo
              construcción.
            </li>
            <li>
              Puedes usar el zoom y pan para ajustar la vista del área de
              trabajo.
            </li>
          </ul>

          <Button
            onClick={handleClose}
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Entendido
          </Button>
        </Box>
      </Modal>

      {/* Modal mejorado para crear nuevo rack */}
      <Dialog
        open={isNewRackModalOpen}
        onClose={() => setIsNewRackModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Building2 size={24} />
            Crear Nuevo Rack
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Configuración del Rack
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Cantidad de Pisos</InputLabel>
              <Select
                value={newRackFloorsCount}
                label="Cantidad de Pisos"
                onChange={(e) => setNewRackFloorsCount(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num} {num === 1 ? "Piso" : "Pisos"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Vista previa de los pisos */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Vista Previa de Pisos:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                }}
              >
                {Array.from({ length: newRackFloorsCount }, (_, i) => (
                  <Chip
                    key={i}
                    label={`Piso ${i + 1}`}
                    color="primary"
                    variant="outlined"
                    sx={{ width: "fit-content" }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsNewRackModalOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleCreateRack}
            variant="contained"
            color="primary"
            startIcon={<Building2 />}
          >
            Crear Rack
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Deposito;
