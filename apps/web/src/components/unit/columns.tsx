// import { MoreHorizontal } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { type ColumnDef } from "@tanstack/react-table";
// import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
// import { useState } from "react";
// import { handleError } from "@/lib/utils";
import { Project, PartVariation, Unit, Part } from "@cloud/shared";

// type ActionsProps = {
//   elem: { id: string };
//   children?: React.ReactNode;
// };

// const Actions = ({ elem, children }: ActionsProps) => {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" className="h-8 w-8 p-0">
//           <span className="sr-only">Open menu</span>
//           <MoreHorizontal className="h-4 w-4" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent onClick={(e) => e.stopPropagation()} align="end">
//         <DropdownMenuLabel>Actions</DropdownMenuLabel>
//         <DropdownMenuItem
//           onClick={() =>
//             toast.promise(navigator.clipboard.writeText(elem.id), {
//               success: "Copied to clipboard",
//               error: (err) => "Failed to copy: " + err,
//             })
//           }
//         >
//           Copy ID
//         </DropdownMenuItem>
//         {children}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };

export const unitColumns: ColumnDef<
  Unit & { projects: Project[]; partVariation: PartVariation }
>[] = [
  {
    accessorKey: "name",
    header: "Instance SN",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.serialNumber}</Badge>;
    },
  },
  {
    accessorKey: "partVariation",
    header: "Part Variation",
    cell: ({ row }) => {
      return <Badge>{row.original.partVariation.partNumber}</Badge>;
    },
  },
  {
    accessorKey: "project",
    header: "Project",
    cell: ({ row }) => {
      const projects = row.original.projects;

      return (
        <div>
          {projects.map((p) => (
            <Badge key={p.id} variant="outline">
              {p.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  // TODO: Finish display of components
  // {
  //   accessorKey: "parts",
  //   header: "Components",
  //   cell: ({ row }) => {
  //     const byPartVariation = _.groupBy(row.original.parts, (p) => p.partVariation.name);
  //
  //     return (
  //       <div className="flex flex-col gap-2">
  //         {Object.entries(byPartVariation).map(([partVariationName, devices], idx) => (
  //           <div className="flex items-start gap-1" key={idx}>
  //             <Badge className="">{partVariationName}</Badge>
  //             <div className="flex flex-col gap-1">
  //               {devices.map((d) => (
  //                 <Badge variant="secondary" key={d.id}>
  //                   {d.name}
  //                 </Badge>
  //               ))}
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     );
  //   },
  // },
  {
    id: "actions",
    header: "Actions",
    // cell: UnitActions,
  },
];

// function UnitActions({
//   row,
// }: {
//   row: Row<Unit & { projects: Project[]; partVariation: PartVariation }>;
// }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const deleteUnit = api.unit.deleteUnit.useMutation();
//   const utils = api.useUtils();
//   return (
//     <>
//       <AlertDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete your
//               system instance and remove your data from our servers. <br />
//               The device instances within this system{" "}
//               <b>will not be removed.</b>
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogContent></AlertDialogContent>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() =>
//                 toast.promise(
//                   deleteUnit.mutateAsync(
//                     {
//                       unitId: row.original.id,
//                     },
//                     {
//                       onSuccess: () => {
//                         void utils.unit.getAllUnit.invalidate();
//                       },
//                     },
//                   ),
//                   {
//                     loading: "Deleting your system instance...",
//                     success: "Your system instance has been deleted.",
//                     error: handleError,
//                   },
//                 )
//               }
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//       <Actions elem={row.original}>
//         <DropdownMenuItem onClick={() => setIsOpen(true)}>
//           Delete
//         </DropdownMenuItem>
//       </Actions>
//     </>
//   );
// }

// type DeleteDialogProps = {
//   isOpen: boolean;
//   setIsOpen: (open: boolean) => void;
//   partVariation: PartVariation;
//   onSuccess: () => void;
// };

// const DeleteDialog = ({
//   isOpen,
//   setIsOpen,
//   partVariation,
//   onSuccess,
// }: DeleteDialogProps) => {
//   const deletePartVariation = api.partVariation.deletePartVariation.useMutation();
//   return (
//     <AlertDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
//       <AlertDialogContent onClick={(e) => e.stopPropagation()}>
//         <AlertDialogHeader>
//           <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//           <AlertDialogDescription>
//             This action cannot be undone. This will permanently delete your
//             partVariation and remove your data from our servers. <br /> This partVariation can
//             only be deleted if there are:
//             <ul className="list-inside list-disc">
//               <li>no unit instances of this partVariation. </li>
//               <li>no projects using this partVariation.</li>
//               <li>no system partVariations using this device partVariation. </li>
//             </ul>
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogContent>
//           {/* TODO: Show a list of devices or systems that use this partVariation */}
//         </AlertDialogContent>
//         <AlertDialogFooter>
//           <AlertDialogCancel>Cancel</AlertDialogCancel>
//           <AlertDialogAction
//             onClick={() =>
//               toast.promise(
//                 deletePartVariation.mutateAsync(
//                   {
//                     partVariationId: partVariation.id,
//                   },
//                   {
//                     onSuccess,
//                   },
//                 ),
//                 {
//                   loading: "Deleting your partVariation...",
//                   success: "Your partVariation has been deleted.",
//                   error: handleError,
//                 },
//               )
//             }
//           >
//             Delete
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// };

export const partColumns: ColumnDef<Part>[] = [
  {
    accessorKey: "name",
    header: "PIN",
    cell: ({ row }) => {
      return <Badge>{row.original.name}</Badge>;
    },
  },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: PartVariationActions,
  // },
];

// function PartVariationActions({ row }: { row: Row<PartVariation> }
