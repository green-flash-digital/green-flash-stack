import type { Meta } from "@storybook/react";

import { Layout } from "./Layout.js";
import { LayoutBody } from "./LayoutBody.js";
import { LayoutBodyBreadcrumb } from "./LayoutBodyBreadcrumb.js";
import { LayoutBodyBreadcrumbText } from "./LayoutBodyBreadcrumbText.js";
import { LayoutBodyMain } from "./LayoutBodyMain.js";
import { LayoutBodyNav } from "./LayoutBodyNav.js";
import { LayoutBodyTOC } from "./LayoutBodyTOC.js";
import { LayoutHeader } from "./LayoutHeader.js";

const meta: Meta = {
  title: "Layout",
} satisfies Meta<typeof meta>;

export default meta;

const Content = () => (
  <div>
    <p>
      Etiam porta sem malesuada magna mollis euismod. Donec id elit non mi porta
      gravida at eget metus. Praesent commodo cursus magna, vel scelerisque nisl
      consectetur et. Integer posuere erat a ante venenatis dapibus posuere
      velit aliquet. Donec sed odio dui. Nulla vitae elit libero, a pharetra
      augue.
    </p>
    <p>
      Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget
      lacinia odio sem nec elit. Cum sociis natoque penatibus et magnis dis
      parturient montes, nascetur ridiculus mus. Lorem ipsum dolor sit amet,
      consectetur adipiscing elit. Fusce dapibus, tellus ac cursus commodo,
      tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.
      Nulla vitae elit libero, a pharetra augue. Etiam porta sem malesuada magna
      mollis euismod. Vestibulum id ligula porta felis euismod semper.
    </p>

    <p>
      Donec id elit non mi porta gravida at eget metus. Cum sociis natoque
      penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean
      eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.
      Vestibulum id ligula porta felis euismod semper. Etiam porta sem malesuada
      magna mollis euismod.
    </p>
  </div>
);

export const DocsLayout = () => {
  return (
    <Layout>
      <LayoutHeader header={undefined} />
      <LayoutBody>
        <LayoutBodyNav graph={{}} />
        <LayoutBodyMain>
          <h1>Hello!</h1>
          <Content />
        </LayoutBodyMain>
        <LayoutBodyTOC tableOfContents={[]} />
      </LayoutBody>
    </Layout>
  );
};

export const WithBreadcrumb = () => {
  return (
    <Layout>
      <LayoutHeader header={undefined} />
      <LayoutBody>
        <LayoutBodyNav graph={{}} />
        <LayoutBodyBreadcrumb>
          <ul>
            <li>
              <LayoutBodyBreadcrumbText>breadcrumb</LayoutBodyBreadcrumbText>
            </li>
            <li>
              <LayoutBodyBreadcrumbText className="active">
                hello
              </LayoutBodyBreadcrumbText>
            </li>
          </ul>
        </LayoutBodyBreadcrumb>
        <LayoutBodyMain>
          <h1>Hello!</h1>
          <Content />
        </LayoutBodyMain>
        <LayoutBodyTOC tableOfContents={[]} />
      </LayoutBody>
    </Layout>
  );
};
