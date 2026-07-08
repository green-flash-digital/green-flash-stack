import { Button } from "~/components/Button";
import { Modal } from "~/components/Modal";
import { useModal } from "~/components/Modal.useModal";
import { ModalBody } from "~/components/ModalBody";
import { ModalHeader } from "~/components/ModalHeader";
import { NavTab } from "~/components/NavTab";
import { NavTabContent } from "~/components/NavTabContent";
import { NavTabLabel } from "~/components/NavTabLabel";
import { NavTabs } from "~/components/NavTabs";
import { IconHelpCircle } from "~/icons/IconHelpCircle";

export function FontFamilyPreviewControlsHelp() {
  const modal = useModal();
  return (
    <>
      <Button
        dxVariant="icon"
        DXIcon={IconHelpCircle}
        dxStyle="outlined"
        dxSize="normal"
        onClick={modal.open}
        dxHelp="Help"
      />
      <Modal dxEngine={modal} ref={modal.onMount} dxType="drawer" dxVariant="right" dxSize="lg">
        <ModalHeader>Font family help</ModalHeader>
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
                    <h3>The font styles aren&apos;t displaying when I select a style</h3>
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
      </Modal>
    </>
  );
}
