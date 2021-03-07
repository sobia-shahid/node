import React from 'react';
import { DragPreviewImage, useDrag } from 'react-dnd';
import { IconTypes }  from '../utils/Constants';

export const HotSpot = ({ name, iconType, iconIndex, selected, handleMouseDown, children}) => {
  const [{ isDragging }, drag, preview] = useDrag({
    item: {
      name: name,
      iconType: iconType,
      index: iconIndex,
      type: IconTypes.ICON
    },  // set data to dragged item object
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  return (
    <>
      <DragPreviewImage connect={preview} src={children}/>
      <div
        ref={drag}
        className={selected ? "selected-icon" : null}
        onMouseDown={handleMouseDown}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      >
        {children}
      </div>
    </>
  )
}
