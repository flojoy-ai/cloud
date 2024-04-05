import { useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Cpu, History, MinusCircle, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { UnitRevision, RevisionType } from "@cloud/shared";

const iconMap: Record<RevisionType, JSX.Element> = {
  add: <PlusCircle size={20} className="stroke-green-500/60" />,
  remove: <MinusCircle size={20} className="stroke-red-500/60" />,
  init: <Cpu size={20} className="stroke-muted-foreground" />,
};

type Props = {
  revisions: UnitRevision[];
};

const RevisionHistory = ({ revisions }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <History size={24} className="stroke-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Revision history</DialogTitle>
          <DialogDescription>
            See the history of the components of this unit device.
          </DialogDescription>
        </DialogHeader>

        <div className="h-96 overflow-y-auto">
          {revisions.map((rev) => (
            <Card key={rev.createdAt.toString()} className="mt-2 p-4">
              <div className="flex items-center gap-2">
                {iconMap[rev.revisionType]} {rev.componentSerialNumber}
              </div>
              <div className="py-0.5" />
              <div className="text-sm italic text-muted-foreground">
                {rev.userEmail} - ({rev.createdAt.toLocaleString()})
              </div>
            </Card>
          ))}
        </div>
        <DialogFooter className="">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RevisionHistory;
