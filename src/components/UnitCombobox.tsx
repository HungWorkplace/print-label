import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const units = [
  "kg",
  "g",
  "lít",
  "ml",
  "cái",
  "chiếc",
  "bịch",
  "gói",
  "hộp",
  "thùng",
  "chai",
  "lon",
  "túi",
  "bó",
  "cây",
  "bông",
  "nhánh",
  "lá",
  "quả",
  "trái",
  "con",
  "cặp",
  "đôi",
  "bộ",
  "set",
  "lốc",
  "tấm",
  "tờ",
  "túi",
  "bịch",
  "hũ",
  "lọ",
  "chai",
  "bình",
  "can",
  "thùng",
  "khay",
  "đĩa",
  "ly",
  "cốc",
  "bát",
  "tô",
  "mét",
  "cm",
  "m²",
  "m³",
];

interface UnitComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export function UnitCombobox({ value, onValueChange, onKeyDown }: UnitComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const filteredUnits = React.useMemo(() => {
    if (!searchValue) return units;
    const lowerSearch = searchValue.toLowerCase();
    return units.filter((unit) => unit.toLowerCase().includes(lowerSearch));
  }, [searchValue]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
    setSearchValue("");
    // Focus vào ô giá sau khi chọn đơn vị
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('input[placeholder="0"]')?.focus();
    }, 100);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue("");
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between rounded-2xl h-12 text-base border-2 focus:border-blue-500 transition-all",
            !value && "text-muted-foreground"
          )}
          onKeyDown={onKeyDown}
        >
          {value || "Chọn đơn vị..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-2xl" align="start">
        <Command>
          <CommandInput
            placeholder="Tìm đơn vị..."
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-12"
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Không tìm thấy đơn vị
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (searchValue.trim()) {
                      handleSelect(searchValue.trim());
                    }
                  }}
                >
                  Sử dụng "{searchValue}"
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredUnits.map((unit) => (
                <CommandItem
                  key={unit}
                  value={unit}
                  onSelect={() => handleSelect(unit)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === unit ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {unit}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
