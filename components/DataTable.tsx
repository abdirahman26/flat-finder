"use client"

import * as React from "react"
import { IconX } from "@tabler/icons-react" 
import { updateListingStatus , deleteListing, assignReviewer } from "@/app/(auth)/actions";
import { Plus, Building, Trash2, Eye, Edit, Home } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"


import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// export const schema = z.object({
//   id: z.number(),
//   listingTitle: z.string(),
//   address: z.string(),
//   listingStatus: z.string(),
//   landlordName: z.string(),
//   landlordEmail: z.string(),
//   reviewer: z.string(),
// })

export const schema = z.object({
  listing_id: z.string(),
  title: z.string(),
  city: z.string(),
  area_code: z.string(),
  is_verified: z.string(),
  reviewer: z.string().nullable(),
  users: z.object({
    email: z.string(),
    first_name: z.string(),
  }),
});



function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

function handleAction(action: string, listing: z.infer<typeof schema>) {
  switch (action) {
    case "Verify":
      updateListingStatus(listing.listing_id, "Verified")
      break;
    case "FDM Approved":
      updateListingStatus(listing.listing_id, "FDM Verified")
      break;
    case "Reject":
      updateListingStatus(listing.listing_id, "Rejected")
      break;
    case "Delete":

      deleteListing(listing.listing_id)
      break;
    default:
      console.warn("Unhandled action:", action);
  }
}


export const getColumns = (
  uniqueReviewers: (string | null)[]
): ColumnDef<z.infer<typeof schema>>[] => [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.listing_id} />, // Use listing_id as unique key
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-custom-light"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Listing Title",
    cell: ({ row }) => <TableCellViewer item={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: "city",
    id: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted px-1.5">
          {`${row.original.city}, ${row.original.area_code}`}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "is_verified",
    id: "Listing Status",
    header: "Listing Status",
    cell: ({ row }) => {
      const status = row.original.is_verified;
      const isVerified = row.original.is_verified
      console.log("Listing Status:", status);
      let icon = null;
      let text = status;

      if (status === "Verified") {
        icon = <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 size-4" />;
      } else if (status === "Rejected") {
        icon = <IconX className="text-red-500 size-4" />;
      } else if (status === "FDM Verified") {
        icon = <IconCircleCheckFilled className="fill-blue-500 size-4" />;
        text = "FDM Verified";
      } else if (row.original.reviewer) {
        icon = <IconLoader className="animate-spin size-4 text-muted-foreground" />;
        text = "In Progress";
      } else if (status === "Unverified") {
        icon = <IconLoader className="animate-spin size-4 text-yellow-500" />;
      } 

      return (
        <Badge variant="outline" className="text-muted px-1.5 gap-1 flex items-center">
          {icon} {text}
        </Badge>
      );
    },
  },
  {
    accessorKey: "users.first_name",
    id: "landlord Name",
    header: "Landlord Name",
    cell: ({ row }) => {
      const name = row.original.users.first_name;
      const display = name.length > 20 ? name.slice(0, 20) + "..." : name;
      return <div className="truncate text-sm text-muted">{display}</div>;
    },
  },
  {
    accessorKey: "users.email",
    id: "landlord Email",
    header: "Landlord Email",
    cell: ({ row }) => {
      const email = row.original.users.email;
      const display = email.length > 20 ? email.slice(0, 20) + "..." : email;
      return <div className="truncate text-sm text-muted">{display}</div>;
    },
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => {
      const value = row.original.reviewer;
      const id = row.original.listing_id;
  
      // If already assigned, just show the reviewer's name
      if (value) return value;
  
      return (
        <>
          <Label htmlFor={`${id}-reviewer`} className="sr-only">
            Reviewer
          </Label>
          <Select
            onValueChange={async (selectedReviewer) => {
              try {
                await assignReviewer(id, selectedReviewer);
                console.log(`Assigned reviewer '${selectedReviewer}' to listing '${id}'`);
              } catch (err) {
                console.error("Failed to assign reviewer", err);
              }
            }}
          >
            <SelectTrigger
              className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate data-[placeholder]:text-muted"
              size="sm"
              id={`${id}-reviewer`}
            >
              <SelectValue placeholder="Assign reviewer" />
            </SelectTrigger>
            <SelectContent align="end">
              {uniqueReviewers
                .filter((r): r is string => r !== null)
                .map((reviewer) => (
                  <SelectItem key={reviewer} value={reviewer}>
                    {reviewer}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const status = row.original.is_verified;
  
      // Define available options (excluding Delete)
      const options = (() => {
        if (status === "Unverified") {
          return ["Verify", "FDM Approved", "Reject"];
        } else if (status === "Rejected") {
          return ["Verify", "FDM Approved"];
        } else if (status === "FDM Verified") {
          return ["Verify", "Reject"];
        }
        else if (status === "Verified") {
          return ["FDM Verified", "Reject"];
        }
        return []; // Fallback for unknown status
      })();
  
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
          {options.map((option) => (
            <DropdownMenuItem
              key={option}
              onSelect={() => handleAction(option, row.original)}
            >
              {option}
            </DropdownMenuItem>
          ))}
  
            {options.length > 0 && <DropdownMenuSeparator />}
  
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => handleAction("Delete", row.original)}
            >
              Delete
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];



 // {
  //   id: "viewDelete",
  //   header: "Actions",
  //   cell: ({ row }) => {
  //     const property = row.original
  
  //     return (
  //       <TableCell className="">
  //         <div className="flex gap-2">
  //           <Button
  //             variant="outline"
  //             size="icon"
  //             onClick={() => {}}
  //           >
  //             <Eye className="" />
  //           </Button>
  //           <Button
  //             variant="destructive"
  //             size="icon"
  //             onClick={() => {}}
  //           >
  //             <Trash2 className="" />
  //           </Button>
  //         </div>
  //       </TableCell>
  //     )
  //   },
  // },


function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.listing_id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 hover:bg-custom-gray-hover data-[state=selected]:bg-custom-gray-selected"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}
export function DataTable({
  data,
  uniqueReviewers,
}: {
  data: z.infer<typeof schema>[];
  uniqueReviewers: (string | null)[];
}) {
  // const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ listing_id }) => listing_id) || [],
    [data]
  )

  const [tableData, setTableData] = React.useState(data); // initialize from props

  React.useEffect(() => {
    setTableData(data); 
  }, [data]);


  const table = useReactTable({
    data,
    columns: getColumns(uniqueReviewers),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.listing_id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setTableData((prev) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="max-w-7xl mx-auto flex-col justify-start gap-6 text-muted"
    >
      <div className="flex items-center justify-between">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">Listings</SelectItem>
            <SelectItem value="past-performance">Complaint</SelectItem>
        
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="past-performance">
            Past Performance <Badge variant="secondary">3</Badge>
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add Section</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto "
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-muted hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  )
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="link" className="text-muted w-fit px-0 text-left">
          {item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.title}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Listing Status</Label>
                <Select defaultValue={item.is_verified}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="reviewer">Reviewer</Label>
                <Select defaultValue={item.reviewer ?? ""}>
                  <SelectTrigger id="reviewer" className="w-full">
                    <SelectValue placeholder="Select a reviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Taher">Taher</SelectItem>
                    <SelectItem value="Hesse">Hessa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}


export default DataTable


function setData(updater: (data: z.infer<typeof schema>[]) => z.infer<typeof schema>[]) {
  // Assuming this function is used to update the data state
  // You can implement it as a state setter function
  const [data, setDataState] = React.useState<z.infer<typeof schema>[]>([]);

  setDataState((prevData) => updater(prevData));
}
