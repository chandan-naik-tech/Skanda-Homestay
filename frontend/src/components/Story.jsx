import { Link } from '../lib/router.jsx';
import { useSite } from '../content/SiteContext.jsx';
import { filled, isSampleImage } from '../lib/merge.js';
import { Reveal, SampleBadge } from './ui.jsx';

export default function Story() {
  const { content, showPlaceholders } = useSite();
  const { story } = content;
  const [pull, ...body] = (story.paragraphs || []).filter(filled);
  const steps = (story.timeline || []).filter((t) => filled(t.title));

  return (
    <section id="story" className="section section--soft" aria-labelledby="story-title">
      <div className="wrap story__grid">
        <Reveal className="story__media">
          <div className="story__frame">
            <img src={story.image} alt="" width="1000" height="1250" loading="lazy" decoding="async" />
            {isSampleImage(story.image) ? <SampleBadge /> : null}
          </div>
        </Reveal>

        <Reveal className="story__copy" delay={100}>
          <h2 id="story-title">{story.heading}</h2>
          <p className="story__sub">{story.subheading}</p>
          {pull ? <blockquote className="story__pull">{pull}</blockquote> : null}
          {body.map((t) => <p key={t}>{t}</p>)}
          {showPlaceholders ? <p className="draft-note">This story is draft copy. Edit it in defaultContent.js so it is truly yours.</p> : null}

          {steps.length ? (
            <ol className="timeline">
              {steps.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  {filled(s.text) ? <p>{s.text}</p> : null}
                </li>
              ))}
            </ol>
          ) : null}

          <Link to="/#host" className="btn btn--secondary">Meet Your Host</Link>
        </Reveal>
      </div>
    </section>
  );
}
