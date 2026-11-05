export default function Logo() {
  return (
    <a className="logo" href="#inicio" aria-label="CANOPA, início">
      <img src={`${import.meta.env.BASE_URL}images/canopa-logo.png`} width="1716" height="657" alt="CANOPA" />
    </a>
  )
}
