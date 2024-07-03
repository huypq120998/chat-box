export const initTooltip = () => {
  const tooltips = Array.from(
    document.querySelectorAll("[data-tooltip-container]")
  )

  // eslint-disable-next-line array-callback-return
  tooltips.map((tooltip: any) => {
    tooltip.addEventListener("mouseover", handleMouseOver)
  })

  function handleMouseOver(this: any) {
    const tooltipbox = createTooltipBox(this)
    if (tooltipbox) {
      handleMouseMove.tooltipbox = tooltipbox
      this.addEventListener("mousemove", handleMouseMove)

      handleMouseLeave.tooltipbox = tooltipbox
      handleMouseLeave.element = this
      this.addEventListener("mouseleave", handleMouseLeave)
    }
  }

  const handleMouseLeave: any = {
    handleEvent(this: any) {
      this.tooltipbox.remove()
      this.element.removeEventListener("mousemove", handleMouseMove)
      this.element.removeEventListener("mouseleave", handleMouseLeave)
    },
  }

  const handleMouseMove: any = {
    handleEvent(e: any) {
      const doc = document.documentElement
      const body = doc.getElementsByTagName("body")[0]
      const y = window.innerHeight || doc.clientHeight || body.clientHeight

      if (y - e.clientY < 350) {
        this.tooltipbox.style.bottom = y - e.clientY + 25 + "px"
      } else {
        this.tooltipbox.style.top = e.clientY + 25 + "px"
      }
      this.tooltipbox.style.left = e.clientX + 13 + "px"
    },
  }

  function createTooltipBox(el: any) {
    const labelData = el.getAttribute("data-tooltip-label")
    if (labelData) {
      const tooltip = document.createElement("div")
      tooltip.innerHTML = el.getAttribute("data-tooltip-label")
      tooltip.classList.add("court-tooltip")

      document.body.appendChild(tooltip)

      return tooltip
    }
    return false
  }
}

// initTooltip();
