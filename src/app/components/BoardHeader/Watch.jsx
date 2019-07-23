import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Button, Wrapper, Menu, MenuItem } from "react-aria-menubutton";
import { withTranslation } from "react-i18next";
import PropTypes from "prop-types";
import FaEye from "react-icons/lib/fa/eye"
import "./ColorPicker.scss";



class Watch extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    boardId: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    currentWatchMode: PropTypes.string.isRequired,
  };
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    handleSelection = newWatchMode => {
      const { dispatch, boardId, userId } = this.props;
      // Dispatch update only if selected color is not the same as current board color.
      if (newWatchMode !== this.props.currentWatchMode) {
        dispatch({ type: "CHANGE_USER_WATCH", payload: { boardId, userId, newWatchMode } });
      }
    };

    render() {
      const watchModes = ["Watching", "Not watching", "Ignoring"];

      const menuItems = watchModes.map((watch, i) => {
        return (
          <li key={i}>
            <MenuItem className='MyMenuButton-menuItem'>
              {watch}
            </MenuItem>
          </li>
        );
      });
      return (
        <Wrapper
          className="MyMenuButton"
          onSelection={this.handleSelection}
        >
          <Button className='MyMenuButton-button'>
            <FaEye />
          </Button>
          <Menu className="MyMenuButton-menu">
           <ul>{menuItems}</ul>
          </Menu>
        </Wrapper>
      );
    }
  }

  const mapStateToProps = (state, ownProps) => {
    const { boardId } = ownProps.match.params;
    const { user } = state;
    return {
      boardId,
      userId: user._id,
      currentWatchMode: state.boardsById[boardId].users.find(boardUser=>boardUser.id === user._id).watch
    };
  };
  


export default withRouter(connect(mapStateToProps)(withTranslation()(Watch)));;