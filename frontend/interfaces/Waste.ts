
export interface WasteMaterial {
    id: number;
    name: string;
    meterial_image: string;
    material_name: string;
    waste_category: Categories[];
    waste_categoriesid: Categories[];
    emission_factor: number;
}

export interface Categories {
    id: number;
    name: string;
};

export interface WasteSorting {
    id: number;
    name: string;
    description: string; 
}

export interface WasteData {
    id: number;
    barcode: number;
    name: string;
    waste_image: string;
    amount: number;
    create_at: string | Date; 
    waste_categoriesid: Categories[]; 
    user_id: number;
    waste_sorting: WasteSorting[];
    material_guides: MaterialGuide[];
}

export interface MaterialGuide {
    id: number;
    guide_image: string;
    recommendation: string;
    waste_meterial_name: string; 
}