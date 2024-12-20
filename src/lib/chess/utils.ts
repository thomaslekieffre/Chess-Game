import { PieceColor } from "./types";

export const getOppositeColor = (color: PieceColor): PieceColor =>
  color === "white" ? "black" : "white";
