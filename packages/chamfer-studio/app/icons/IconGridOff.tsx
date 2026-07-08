export const IconGridOff = ({
  dxSize = 24,
  ...restProps
}: React.SVGProps<SVGSVGElement> & { dxSize: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={dxSize}
    height={dxSize}
    color="currentColor"
    fill={"none"}
    {...restProps}
  >
    <path d="M7 2V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17 22V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17 2V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M22 7L11.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2 7L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M22 17L21 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2 17L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2 2L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
