import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Draggable } from "react-beautiful-dnd";
import classnames from "classnames";
import ListHeader from "./ListHeader";
import Cards from "./Cards";
import CardAdder from "../CardAdder/CardAdder";
import "./List.scss";

class List extends Component {
  static propTypes = {
    boardId: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    list: PropTypes.shape({ _id: PropTypes.string.isRequired }).isRequired,
    isAbleToEdit: PropTypes.bool.isRequired
  };

  render = () => {
    const { list, boardId, index, isAbleToEdit } = this.props;
    return (
      <Draggable
        draggableId={list._id}
        index={index}
        isDragDisabled={!isAbleToEdit}
        disableInteractiveElementBlocking
      >
        {(provided, snapshot) => (
          <>
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              className="list-wrapper"
            >
              <div
                className={classnames("list", {
                  "list--drag": snapshot.isDragging
                })}
              >
                <ListHeader
                  dragHandleProps={provided.dragHandleProps}
                  listTitle={list.title}
                  listId={list._id}
                  cards={list.cards}
                  isAbleToEdit={isAbleToEdit}
                  boardId={boardId}
                />
                <div className="cards-wrapper">
                  <Cards listId={list._id} isAbleToEdit={isAbleToEdit} boardId={boardId} />
                </div>
                {isAbleToEdit && <CardAdder listId={list._id} />}
              </div>
            </div>
            {provided.placeholder}
          </>
        )}
      </Draggable>
    );
  };
}

export default connect()(List);
