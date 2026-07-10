export const IconGrid = ({
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
    <path d="M17 2V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M22 7L2 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M22 17L2 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
