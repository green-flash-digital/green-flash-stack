import { ModalBody } from "~/components/ModalBody";
import { ModalHeader } from "~/components/ModalHeader";
import { NavTab } from "~/components/NavTab";
import { NavTabContent } from "~/components/NavTabContent";
import { NavTabLabel } from "~/components/NavTabLabel";
import { NavTabs } from "~/components/NavTabs";

export default function FontVariantPreviewControlsHelpModalContent() {
  return (
    <>
      <ModalHeader>Typography variant help</ModalHeader>
      <ModalBody>
        <NavTabs dxInitActiveTab="general">
          <ul>
            <li>
              <NavTab id="general">
                <NavTabLabel>General</NavTabLabel>
                <NavTabContent>Tab 1 content</NavTabContent>
              </NavTab>
            </li>
            <li>
              <NavTab id="faqs">
                <NavTabLabel>FAQs</NavTabLabel>
                <NavTabContent>
                  <h3>Lorem</h3>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia est doloremque
                    dignissimos architecto a, eum distinctio eius labore similique laboriosam
                    facere laborum blanditiis autem iusto unde error fugit eaque neque!
                  </p>
                  <h3>Question 2</h3>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia est doloremque
                    dignissimos architecto a, eum distinctio eius labore similique laboriosam
                    facere laborum blanditiis autem iusto unde error fugit eaque neque!
                  </p>
                </NavTabContent>
              </NavTab>
            </li>
          </ul>
        </NavTabs>
      </ModalBody>
    </>
  );
}
