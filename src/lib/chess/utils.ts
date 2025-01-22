import { PieceColor } from "../../types/chess";

export const getOppositeColor = (color: PieceColor): PieceColor =>
  color === "white" ? "black" : "white";
