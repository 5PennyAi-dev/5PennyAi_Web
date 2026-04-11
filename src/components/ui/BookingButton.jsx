import Button from '@/components/ui/Button'
import { openBookingModal } from '@/lib/cal'

export default function BookingButton({ onClick, children, ...rest }) {
  const handleClick = (e) => {
    if (onClick) onClick(e)
    openBookingModal()
  }
  return (
    <Button onClick={handleClick} {...rest}>
      {children}
    </Button>
  )
}
