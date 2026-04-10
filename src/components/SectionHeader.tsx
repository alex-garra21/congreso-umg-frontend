import React from 'react';

interface Props {
  tag: string;
  title: string;
}

export default function SectionHeader({ tag, title }: Props) {
  return (
    <div className="sec-head">
      <span className="tag">{tag}</span>
      <span className="sec-title">{title}</span>
    </div>
  );
}