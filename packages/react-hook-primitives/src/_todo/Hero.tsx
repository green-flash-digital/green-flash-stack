import { css } from "@linaria/core";

const heroStyles = css`
  width: 100%;
  position: relative;
  background: rgb(30, 29, 28);
  height: min-content;

  & > div {
    display: grid;
    grid-template-columns: minmax(50%, min-content) 1fr;
    gap: 4rem;
    margin: 0 auto;
    max-width: 90rem;
  }

  img {
    bottom: 0;
    width: 100%;
    left: 0;
    align-self: center;
    object-fit: contain;
    padding: 4rem 0 4rem 4rem;
  }

  .title {
    padding-left: 4rem;
    padding-right: 4rem;
    color: white;

    span.highlight {
      text-decoration: underline;
      font-style: italic;
      color: #f6c539;

      &.alt {
        color: #fb558b;
        font-weight: bold;
      }
    }

    h1 {
      font-size: 64px;
      line-height: 1;
      position: relative;
      padding-top: 4rem;

      margin-bottom: 2rem;
      padding-bottom: 1rem;
    }
    p {
      font-size: 24px;
      line-height: 1.4;

      & + div {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
      }
    }
  }
`;

export function Hero() {
  return (
    <div className={heroStyles}>
      <div>
        <img src="/buttery-components-hero.png" alt="buttery-components-hero" />
        <div className="title">
          <h1>
            Stop <span className="highlight">re-writing</span> the hard stuff.
          </h1>
          <p>
            100% unstyled, WCAG AA compliant React hooks and components that
            significantly increase your development velocity by seamlessly
            integrating with{" "}
            <span className="highlight alt">any styling methodology.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
