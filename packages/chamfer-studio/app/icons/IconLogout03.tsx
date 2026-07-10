export const IconLogout03 = ({
  dxSize = 24,
  ...restProps
}: React.SVGProps<SVGSVGElement> & { dxSize: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={dxSize}
    height={dxSize}
    color={"currentColor"}
    fill={"none"}
    {...restProps}
  >
    <path
      d="M15 3.33782C13.9407 2.48697 12.5305 2 11 2C6.58172 2 3 6.02944 3 11C3 15.9706 6.58172 20 11 20C12.5305 20 13.9407 19.513 15 18.6622"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    ></path>
    <path
      d="M21 11L10.5 11M21 11C21 10.2998 19.0057 8.99793 18.5 8.5M21 11C21 11.7002 19.0057 13.0021 18.5 13.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
  </svg>
);
