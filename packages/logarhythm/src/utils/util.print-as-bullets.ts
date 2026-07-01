import { exhaustiveMatchGuard } from "@green-flash/ts-utils/isomorphic";

type BulletType = "dashes" | "numbers";

type PrintAsBulletsOptions = {
  /**
   * The type of bullet that is displayed
   * @default dashes
   */
  bulletType?: BulletType;
};

const createGetBullet = (type: BulletType) => (index: number) => {
  switch (type) {
    case "dashes":
      return "-";

    case "numbers":
      return `${index + 1}.`;

    default:
      exhaustiveMatchGuard(type);
  }
};

/**
 * Prints an array of strings as an indented set
 * of bullet points.
 */
export function printAsBullets(strArr: string[], options?: PrintAsBulletsOptions) {
  const getBullet = createGetBullet(options?.bulletType ?? "dashes");
  return `${strArr.map((path, i) => `\n\t${getBullet(i)} ${path}`)}`;
}
