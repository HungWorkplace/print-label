import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Settings as SettingsIcon, RotateCcw } from "lucide-react";

const STORAGE_KEY = "print-label-settings";
const DEFAULT_HEIGHT = 40; // mm

interface SettingsData {
  labelHeight: number; // mm
}

export function Settings({
  onHeightChange,
}: {
  onHeightChange: (height: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const settings: SettingsData = JSON.parse(saved);
        setHeight(settings.labelHeight);
        onHeightChange(settings.labelHeight);
      } catch (e) {
        console.error("Failed to load settings", e);
        onHeightChange(DEFAULT_HEIGHT);
      }
    } else {
      setHeight(DEFAULT_HEIGHT);
      onHeightChange(DEFAULT_HEIGHT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHeightChange = (value: number[]) => {
    const newHeight = value[0];
    setHeight(newHeight);
    onHeightChange(newHeight);
    
    // Save to localStorage
    const settings: SettingsData = { labelHeight: newHeight };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  };

  const handleReset = () => {
    setHeight(DEFAULT_HEIGHT);
    onHeightChange(DEFAULT_HEIGHT);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-2xl"
        >
          <SettingsIcon className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cài đặt</DialogTitle>
          <DialogDescription>
            Điều chỉnh cài đặt in tem báo giá
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Chiều cao tem (mm)
              </label>
              <span className="text-lg font-semibold text-blue-600">
                {height} mm
              </span>
            </div>
            <Slider
              value={[height]}
              onValueChange={handleHeightChange}
              min={20}
              max={80}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>20mm</span>
              <span>80mm</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleReset}
            className="rounded-xl"
          >
            <RotateCcw className="mr-2 size-4" />
            Reset về mặc định
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
