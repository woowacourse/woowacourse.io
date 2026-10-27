import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import { Callout } from './components/Callout'
import { Card } from './components/Card'
import { CardGrid } from './components/CardGrid'
import { Toggle } from './components/Toggle'
import { AssetCard } from './components/AssetCard'
import { Timeline, TimelineItem } from './components/Timeline'
import { Placeholder } from './components/Placeholder'
import { Hero } from './components/Hero'
import { CrewJourney } from './components/CrewJourney'
import { TecoWay } from './components/TecoWay'
import { CrewGrowth } from './components/CrewGrowth'
import { CrewVoices } from './components/CrewVoices'
import { CrewVoiceMap } from './components/CrewVoiceMap'
import { CrewThemes } from './components/CrewThemes'
import { BookNote } from './components/BookNote'
import { BookCover } from './components/BookCover'
import { BookReader } from './components/BookReader'
import { BookSample } from './components/BookSample'
import { EnterDocs } from './components/EnterDocs'
import { Reveal } from './components/Reveal'
import { InView } from './components/InView'
import { Traits, Trait } from './components/Traits'
import { Mermaid } from './components/Mermaid'
import { Claim } from './components/Manifesto'
import { PromotionPipeline } from './components/PromotionPipeline'
import { RecruitingStatus } from './components/RecruitingStatus'
import { RecruitingSchedule } from './components/RecruitingSchedule'
import { NoticeList } from './components/NoticeList'
import { NoticeMeta } from './components/NoticeMeta'
import { PlanetNote } from './components/PlanetNote'
import { PageCover } from './components/PageCover'
import { Embed } from './components/Embed'
import { YouTubeLightbox } from './components/YouTubeLightbox'
import { FaqList } from './components/FaqList'
import { CopyField } from './components/CopyField'
import { ExternalPreviewCard } from './components/ExternalPreviewCard'
import { PromptCopyBlock } from './components/PromptCopyBlock'

const docsComponents = getDocsMDXComponents()

export function useMDXComponents(components?: Record<string, React.FC>) {
  return {
    ...docsComponents,
    Callout,
    Card,
    CardGrid,
    Toggle,
    AssetCard,
    Timeline,
    TimelineItem,
    Placeholder,
    Hero,
    CrewJourney,
    TecoWay,
    CrewGrowth,
    CrewVoices,
    CrewVoiceMap,
    CrewThemes,
    BookNote,
    BookCover,
    BookReader,
    BookSample,
    EnterDocs,
    Reveal,
    InView,
    Traits,
    Trait,
    Mermaid,
    Claim,
    PromotionPipeline,
    RecruitingStatus,
    RecruitingSchedule,
    NoticeList,
    NoticeMeta,
    PlanetNote,
    PageCover,
    Embed,
    YouTubeLightbox,
    FaqList,
    CopyField,
    ExternalPreviewCard,
    PromptCopyBlock,
    ...components
  }
}
