import { TagCloud } from 'react-tagcloud';

function DreamTagCloud({ tagCloudData, handleTagClick }) {
  return (
    <TagCloud 
      minSize={16}
      maxSize={40}
      tags={tagCloudData}
      onClick={(tag) => handleTagClick(tag)}
      shuffle={true}
      randomSeed={Math.random()}
      // custom random color options
      // see randomColor package: https://github.com/davidmerfield/randomColor
      colorOptions={{
        luminosity: 'dark',
        hue: 'blue',
      }}

    />
  )
}

export default DreamTagCloud;