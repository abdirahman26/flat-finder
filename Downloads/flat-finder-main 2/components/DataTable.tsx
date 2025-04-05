"use client"

import * as React from "react"
import { IconX } from "@tabler/icons-react"
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "./ui/input"

export const schema = z.object({
  id: z.number(),
  listingTitle: z.string(),
  address: z.string(),
  listingStatus: z.string(),
  landlordName: z.string(),
  landlordEmail: z.string(),
  reviewer: z.string(),
  isComplaint: z.boolean().optional().default(false),
  complaintReason: z.string().optional(),
  complaintStatus: z.enum(["Open", "Resolved"]).optional(),
  reply: z.string().optional(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

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
  )
}




function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
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
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
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

  const [complaints, setComplaints] = React.useState([])
  const [isListing, setIsListing] = React.useState(true)
  const [replyId, setReplyId] = React.useState("")

  const [openDialogId, setOpenDialogId] = React.useState<null | string>(null);

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  const handleReply = (id: string) => {
    setReplyId(id)
    setOpenDialogId(id)
  }

  const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
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
      accessorKey: "Listing Title",
      header: "Listing Title",
      cell: ({ row }) => {
        return <TableCellViewer item={row.original} />
      },
      enableHiding: false,
    },
    {
      accessorKey: "Address",
      header: "Address",
      cell: ({ row }) => (
        <div className="w-32">
          <Badge variant="outline" className="text-muted px-1.5">
            {row.original.address}
          </Badge>
        </div>
      ),
    },

    {
      accessorKey: "Listing Status",
      header: "Listing Status",
      cell: ({ row }) => {
        const status = row.original.listingStatus

        return (
          <Badge variant="outline" className="text-muted px-1.5 gap-1 flex items-center">
            {status === "Verified" ? (
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400 size-4" />
            ) : status === "Unverified" ? (
              <IconX className="text-red-500 size-4" />
            ) : (
              <IconLoader className="animate-spin size-4 text-muted-foreground" />
            )}
            {status}
          </Badge>
        )
      },
    },

    {
      accessorKey: "landlord Name",
      header: "Landlord Name",
      cell: ({ row }) => {
        const name = row.original.landlordName
        const displayName = name.length > 30 ? `${name.slice(0, 30)}...` : name

        return (
          <div className="truncate text-sm text-muted">{displayName}</div>
        )
      },
    },

    {
      accessorKey: "landlord Email",
      header: "Landlord Email",
      cell: ({ row }) => {
        const email = row.original.landlordEmail
        const displayEmail = email.length > 30 ? `${email.slice(0, 30)}...` : email

        return (
          <div className="truncate text-sm text-muted">{displayEmail}</div>
        )
      },
    },


    {
      accessorKey: "reviewer",
      header: "Reviewer",
      cell: ({ row }) => {
        const isAssigned = row.original.reviewer !== "Assign reviewer"

        if (isAssigned) {
          return row.original.reviewer
        }

        return (
          <>
            <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
              Reviewer
            </Label>
            <Select>
              <SelectTrigger
                className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate data-[placeholder]:text-muted"
                size="sm"
                id={`${row.original.id}-reviewer`}
              >
                <SelectValue placeholder="Assign reviewer" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="Taher">Taher</SelectItem>
                <SelectItem value="Hessa">Hessa</SelectItem>
              </SelectContent>
            </Select>
          </>
        )
      },
    },
    {
      id: "actions",
      cell: () => (
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
            <DropdownMenuItem>Verify</DropdownMenuItem>
            <DropdownMenuItem>FDM Approved</DropdownMenuItem>
            <DropdownMenuItem>Reject</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  type CompColumnData = {
    id: string;
    title: string;
    status: string;
    description: string;
    complaint_id: string;
  }
  const compColumns: ColumnDef<CompColumnData>[] = [
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
      accessorKey: "Title",
      header: "Title",
      cell: ({ row }) => row.original.title,
    },
    {
      accessorKey: "Status",
      header: "Status",
      cell: ({ row }) => row.original.status,
    },
    {
      accessorKey: "Description",
      header: "Description",
      cell: ({ row }) => row.original.description,
    },
    {
      id: "Reply",
      header: "Reply",
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleReply(row.original.complaint_id)}
        >
          Reply
        </Button>
      ),
    },
  ];



  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
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
    columns: compColumns,
    state: {
      rowSelection,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });


  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/FetchAllData');
        const data = await response.json();

        if (response.ok) {
          console.log(data);
          setComplaints(data.complaints)

        } else {
          console.log("error");

        }
      } catch (err) {
        console.log(err);

      }
    };

    fetchData();
  }, []);

  const handleChange = (value: string) => {
    console.log(value);
    if (value === "complaints") {
      setIsListing(false)
      setData(complaints)
    } else {
      setIsListing(true)
      setData(initialData)
    }
  }

  const handleAddReply = () => {
    console.log("Hello there! Replying to complait with the id of", replyId);

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
        <Select defaultValue="listings" onValueChange={handleChange}>
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="listings">Listings</SelectItem>
            <SelectItem value="complaints">Complaints</SelectItem>

          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="past-performance">
            Past Performance <Badge variant="secondary">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel">
            Key Personnel <Badge variant="secondary">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">Focus Documents</TabsTrigger>
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
        {!isListing ? (
          // Complaints Table
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {complaintsTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {complaintsTable.getRowModel().rows?.length ? (
                  complaintsTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 hover:bg-custom-gray-hover data-[state=selected]:bg-custom-gray-selected">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={compColumns.length}
                      className="h-24 text-center"
                    >
                      No complaints.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          // Original Table with DnD
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
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      ))}
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
                        colSpan={columns.length}
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
        )}
        <div className="flex items-center justify-between mt-4">
          <div className="text-muted hidden flex-1 text-sm lg:flex">
            {!isListing
              ? `${complaintsTable.getFilteredSelectedRowModel().rows.length} of ${complaintsTable.getFilteredRowModel().rows.length} row(s) selected.`
              : `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
            }
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${!isListing
                  ? complaintsTable.getState().pagination.pageSize
                  : table.getState().pagination.pageSize}`
                }
                onValueChange={(value) => {
                  const size = Number(value);
                  if (!isListing) {
                    complaintsTable.setPageSize(size);
                  } else {
                    table.setPageSize(size);
                  }
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={!isListing
                      ? complaintsTable.getState().pagination.pageSize
                      : table.getState().pagination.pageSize
                    }
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
              Page {!isListing
                ? complaintsTable.getState().pagination.pageIndex + 1
                : table.getState().pagination.pageIndex + 1
              } of{" "}
              {!isListing
                ? complaintsTable.getPageCount()
                : table.getPageCount()
              }
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  if (!isListing) {
                    complaintsTable.setPageIndex(0);
                  } else {
                    table.setPageIndex(0);
                  }
                }}
                disabled={!isListing
                  ? !complaintsTable.getCanPreviousPage()
                  : !table.getCanPreviousPage()
                }
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => {
                  if (!isListing) {
                    complaintsTable.previousPage();
                  } else {
                    table.previousPage();
                  }
                }}
                disabled={!isListing
                  ? !complaintsTable.getCanPreviousPage()
                  : !table.getCanPreviousPage()
                }
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => {
                  if (!isListing) {
                    complaintsTable.nextPage();
                  } else {
                    table.nextPage();
                  }
                }}
                disabled={!isListing
                  ? !complaintsTable.getCanNextPage()
                  : !table.getCanNextPage()
                }
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => {
                  if (!isListing) {
                    complaintsTable.setPageIndex(complaintsTable.getPageCount() - 1);
                  } else {
                    table.setPageIndex(table.getPageCount() - 1);
                  }
                }}
                disabled={!isListing
                  ? !complaintsTable.getCanNextPage()
                  : !table.getCanNextPage()
                }
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
      <Dialog
        open={!!openDialogId}
        onOpenChange={() => setOpenDialogId(null)}
        modal
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to the complain</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right">
                Reply
              </label>
              <Input
                id="title"
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" onClick={() => setOpenDialogId(null)}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="link" className="text-muted w-fit px-0 text-left">
          {item.listingTitle.length > 30 ? `${item.listingTitle.slice(0, 30)}...` : item.listingTitle}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.listingTitle}</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Listing Status</Label>
                <Select defaultValue={item.listingStatus}>
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
                <Select defaultValue={item.reviewer}>
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