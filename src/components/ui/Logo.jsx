export default function Logo() {
  return (
    <a className="logo" href="#inicio" aria-label="CANOPA, início">
      <img src={`${import.meta.env.BASE_URL}images/canopa-logo-480.webp`} width="480" height="184" alt="CANOPA" />
    </a>
  )
}
