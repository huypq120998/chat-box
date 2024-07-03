import { userTheme } from "./userTheme"

export const checkBoxStyles = (checked: string): any => {
  return {
    checkmark: {
      background: checked ? userTheme().color_bg : "#fff",
      opacity: checked ? `1` : "0 !important",
      position: "absolute",
      width: "20px",
      height: "20px",
      textAlign: "center",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      verticalAlign: "middle",
      border: "1px solid `var(--color-primary)`",
    },
    checkbox: {
      border: checked
        ? "1px solid `var(--color-primary)`"
        : `1px solid rgb(50, 49, 48);`,
    },
  }
}
