"use client"

import * as React from "react"
import { IconX } from "@tabler/icons-react" 
import { updateListingStatus , deleteListing, assignReviewer, updateComplaintStatus, deleteComplaint } from "@/app/(auth)/actions";
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
  IconArchive,
  IconCheck,
  IconClock,
  IconSend,
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

import { Input } from "@/components/ui/input"

import messages from "@/app/(main)/admin/complaint_messages.json"

import ComplaintCellViewer from "./ReplyComplaintDrawer";


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

//  schema = z.object({
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

export const complaintSchema = z.object({
  complaint_id: z.string(),
  listing_id: z.string(),
  user_id: z.string(),
  role: z.string(),
  status: z.string(),

  listings: z.object({
    title: z.string(),
    city: z.string(),
  }),

  users: z.object({
    email: z.string(),
    first_name: z.string(),
    role: z.string(),
  }),
  title: z.string(),
  latest_message: z
  .array(
    z.object({
      user_id: z.string(),
      message: z.string(),
      last_message_created_at: z.string(),
      role: z.string(),
    })
  )
  .nullable(),

});


// export type Listing = z.infer<typeof schema>;
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

// function handleAction(action: string, listing: z.infer<typeof schema>) {
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

export function DraggableComplaintRow({
  row,
}: {
  row: Row<z.infer<typeof complaintSchema>>;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.complaint_id,
  });

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
  );
}

// function TableCell({ item }: { item: z.infer<typeof schema> }) {
function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  return (
        <Button variant="link" className="text-muted w-fit px-0 text-left">
          {item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title}
        </Button>
  )
}


export function ListingCellViewer({ item }: { item: z.infer<typeof complaintSchema> }) {
  return (
    <Button variant="link" className="text-muted w-fit px-0 text-left">
      {item.listings.title.length > 20 ? `${item.listings.title.slice(0, 20)}...` : item.listings.title}
    </Button>
  );
}

function setData(updater: (data: z.infer<typeof schema>[]) => z.infer<typeof schema>[]) {
  const [data, setDataState] = React.useState<z.infer<typeof schema>[]>([]);
  setDataState((prevData) => updater(prevData));
}

// function updateListingStatus(listingId: string, status: string) {
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

// handlecomplaintAction
function handleComplaintAction(action: string, complaint: z.infer<typeof complaintSchema>) {
  switch (action) {
    case "Resolved":
      updateComplaintStatus(complaint.complaint_id, "Resolved");
      break;
    case "Reopen":
      updateComplaintStatus(complaint.complaint_id, "Unresolved");
      break;
    case "Reject":
      updateComplaintStatus(complaint.complaint_id, "Rejected");
      break;
    case "Close":
      updateComplaintStatus(complaint.complaint_id, "Closed");
      break;

    case "Delete":
      deleteComplaint(complaint.complaint_id);
      break;

    default:
      console.warn("Unhandled action:", action);
  }
}


// function handleAction(action: string, listing: z.infer<typeof schema>) {
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
                .map((reviewer, index) => (
                  <SelectItem key={`${reviewer}-${index}`} value={reviewer}>
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
        if (!row.original.reviewer) {
          return [];
        }
        else if (status === "Unverified") {
          return ["Verify", "FDM Approved", "Reject"];
        } else if (status === "Rejected") {
          return ["Verify", "FDM Approved"];
        } else if (status === "FDM Verified") {
          return ["Verify", "Reject"];
        }
        else if (status === "Verified") {
          return ["FDM Approved", "Reject"];
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


export const getColumns2 = (): ColumnDef<z.infer<typeof complaintSchema>>[] => [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.complaint_id} />, // Use listing_id as unique key
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

  // complaint title 
  {
    accessorKey: "complaint_title",
    header: "Complaint Title",
    cell: ({ row }) => <ComplaintCellViewer  item={row.original} />,
    enableHiding: false,
  },

  {
    accessorKey: "listing_title",
    header: "Listing Title",
    cell: ({ row }) => <ListingCellViewer item={row.original}/>,

    enableHiding: false,
  },
  // role 
  {
    accessorKey: "role",
    id: "role",
    header: "Role",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="text-muted px-1.5">
          {`${row.original.users.role}`}
        </Badge>
      </div>
    ),
  },
  // name 
  {
    accessorKey: "users.first_name",
    id: "Name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.users.first_name;
      const display = name.length > 20 ? name.slice(0, 20) + "..." : name;
      return <div className="truncate text-sm text-muted">{display}</div>;
    },
  },
  // email
  {
    accessorKey: "users.email",
    id: "Email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.original.users.email;
      const display = email.length > 20 ? email.slice(0, 20) + "..." : email;
      return <div className="truncate text-sm text-muted">{display}</div>;
    },
  },

  // complaint status
  {
    id: "Complaint Status",
    header: "Complaint Status",
    cell: ({ row }) => {
      const complaintStatus = row.original.status?.toLowerCase(); // normalize casing
      const latestRole = row.original.latest_message?.[0]?.role.toLowerCase(); // normalize casing
      // console.log("Complaint Status:", complaintStatus);
      // console.log("Latest Role:", latestRole);
      let label = "";
      let icon = null;
      if (complaintStatus === "resolved") {
        label = "Resolved";
        icon = <IconCircleCheckFilled className="text-green-500 size-4" />;
      } else if (complaintStatus === "rejected") {
        label = "Rejected";
        icon = <IconX className="text-red-500 size-4" />;
      } else if (complaintStatus === "closed") {
        label = "Closed";
        icon = <IconArchive className="text-gray-500 size-4" />;
      } else if (latestRole === "admin") {
        label = "Replied";
        icon = <IconCheck className="text-blue-500 size-4" />;
      } else if (latestRole && latestRole !== "admin") {
        // console.log("Latest Role:", latestRole);
        label = "Waiting for Reply";
        icon = <IconClock className="text-yellow-500 size-4" />;
      }
  
      return (
        <Badge variant="outline" className="text-muted px-1.5 gap-1 flex items-center">
          {icon} {label}
        </Badge>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase();
  
      const options = (() => {
        if (status === "resolved") {
          return ["Reject", "Close"];
        } else if (status === "unresolved") {
          return ["Resolved", "Close", "Reject"];
        } else if (status === "rejected") {
          return ["Resolved", "Close"];
        } else if (status === "closed") {
          return ["Reopen"];
        }
        return [];
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
                onSelect={() => handleComplaintAction(option, row.original)}
              >
                {option}
              </DropdownMenuItem>
            ))}
  
            {options.length > 0 && <DropdownMenuSeparator />}
  
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => handleComplaintAction("Delete", row.original)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }
]


// function DataTable({ data }: { data: z.infer<typeof schema>[] }) {
export function DataTable({
  data,
  uniqueReviewers,
  complaintData,
}: {
  data: z.infer<typeof schema>[];
  complaintData: z.infer<typeof complaintSchema>[];
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

  const [tableData, setTableData] = React.useState(data); // initialize from props

  const [complaints, setComplaints] = React.useState<z.infer<typeof complaintSchema>[]>(complaintData ?? []);

  React.useEffect(() => {
    setComplaints(complaintData ?? []);
  }, [complaintData]);
  

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => tableData.map((row) => row.listing_id),
    [tableData]
  );

  const complaintIds = React.useMemo<UniqueIdentifier[]>(
    () => complaints.map((row) => row.complaint_id),
    [complaints]
  );

  React.useEffect(() => {
    setTableData(data); 
  }, [data]);

    

  const table = useReactTable({
    data: tableData,
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

  const complaintsTable = useReactTable({
  data: complaints,
  columns: getColumns2(),
  state: {
    sorting,
    columnVisibility,
    rowSelection,
    columnFilters,
    pagination,
  },
  getRowId: (row) => row.complaint_id.toString(),
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
});

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

  const [tabValue, setTabValue] = React.useState("outline");


  return (
    <Tabs
      value={tabValue}
      onValueChange={setTabValue}
      className="max-w-7xl mx-auto flex-col justify-start gap-6 text-muted"
    >
      <div className="flex items-center justify-between">

        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select value={tabValue} onValueChange={setTabValue}>
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
                <span className="hidden lg:inline">Customise Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
            {(tabValue === "outline" ? table : complaintsTable)
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" && column.getCanHide()
              )
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </DropdownMenuCheckboxItem>
              ))}
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
        className="relative flex flex-col gap-4 overflow-auto"
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
                {complaintsTable.getHeaderGroups().map((headerGroup) => (
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
                {complaintsTable.getRowModel().rows?.length ? (
                  <SortableContext
                    items={complaintIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {complaintsTable.getRowModel().rows.map((row) => (
                      <DraggableComplaintRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={complaintsTable.getAllColumns().length}
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
            {complaintsTable.getFilteredSelectedRowModel().rows.length} of{" "}
            {complaintsTable.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${complaintsTable.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  complaintsTable.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={complaintsTable.getState().pagination.pageSize}
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
              Page {complaintsTable.getState().pagination.pageIndex + 1} of{" "}
              {complaintsTable.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => complaintsTable.setPageIndex(0)}
                disabled={!complaintsTable.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => complaintsTable.previousPage()}
                disabled={!complaintsTable.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => complaintsTable.nextPage()}
                disabled={!complaintsTable.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => complaintsTable.setPageIndex(complaintsTable.getPageCount() - 1)}
                disabled={!complaintsTable.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
  
    </Tabs>
  )
}

export default DataTable