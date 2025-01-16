type dropFieldType = {
  type:'drop';
  accept:string[];
  // value:null|BrickData;
  child:number[];
  id:number;
  acceptMany:boolean;
} 

type numberFieldType = {
  type:'number';
  value:number;
  id:number;
}

type inputFieldType = {
  type:'input';
  value:string;
  id:number;
}

type customSelectFieldType = {
  type:'select';
  value:any[];
  id:number;
}

// type fieldType = dropFieldType|numberFieldType|inputFieldType|customSelectFieldType 
export type fieldType = dropFieldType 

export type BrickData = {
  id: number;
  x: number;
  y: number;
  color: string;
  content: string;
  type:string;
  holes?:fieldType[];
  parent:number|null;
  parenthole:number|null
}

export interface DragItem {
  id: number;
  type: string;
}