import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import { Eye, Trash2 } from "lucide-react";
  
  interface PropertyListing {
    listing_id: string;
    title: string;
    description: string;
    price: number;
    city: string;
    area: string;
    bedrooms: number;
    bathrooms: number;
    area_code: string;
  }
  
  interface PropertyListProps {
    properties: PropertyListing[];
    onView: (property: PropertyListing) => void;
    onRemove: (id: string) => void;
  }
  
  export const PropertyList = ({ 
    properties = [], 
    onView = () => {}, 
    onRemove = () => {} 
  }: Partial<PropertyListProps>) => {
    return (
      <Table>
        <TableHeader className="background-white">
          <TableRow>
            <TableHead className="text-white">Title</TableHead>
            <TableHead className="text-white">Location</TableHead>
            <TableHead className="text-white">Price</TableHead>
            <TableHead className="text-white">Bedrooms</TableHead>
            <TableHead className="text-white">Bathrooms</TableHead>
            <TableHead className="text-right text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No properties listed yet.
              </TableCell>
            </TableRow>
          ) : (
            properties.map((property) => (
              <TableRow key={property.listing_id}>
                <TableCell className="font-medium">{property.title}</TableCell>
                <TableCell>{property.area}, {property.city}</TableCell>
                <TableCell>${property.price.toLocaleString()}/month</TableCell>
                <TableCell>{property.bedrooms}</TableCell>
                <TableCell>{property.bathrooms}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onView(property)}
                      aria-label="View property"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onRemove(property.listing_id)}
                      aria-label="Delete property"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };