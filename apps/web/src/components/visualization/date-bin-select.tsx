import { TimePeriod } from "@cloud/shared";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props = {
  bin: TimePeriod;
  setBin: (bin: TimePeriod) => void;
};

export const DateBinSelect = ({ bin, setBin }: Props) => {
  return (
    <ToggleGroup size="sm" type="single" value={bin} onValueChange={setBin}>
      <ToggleGroupItem className="text-muted-foreground" value="day">
        D
      </ToggleGroupItem>
      <ToggleGroupItem className="text-muted-foreground" value="week">
        W
      </ToggleGroupItem>
      <ToggleGroupItem className="text-muted-foreground" value="month">
        M
      </ToggleGroupItem>
      <ToggleGroupItem className="text-muted-foreground" value="year">
        Y
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
