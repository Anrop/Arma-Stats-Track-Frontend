import React, { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import { connect } from 'react-redux';
import ArmaMap from '../components/ArmaMap';
import { loadEvents, seekEvents, stopEvents } from '../actions/events';
import { fetchMissionsIfNeeded } from '../actions/missions';
import worlds from '../data/worlds';

export default class Mission extends Component {
  componentDidMount() {
    const { dispatch, params } = this.props;
    dispatch(fetchMissionsIfNeeded());
    dispatch(loadEvents(params.id));
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(stopEvents());
  }

  render() {
    const { markers, isFetching, lastUpdated, time, world } = this.props;

    return (
      <div id="map-container">
        {isFetching && markers.length === 0 &&
          <h2>Loading...</h2>
        }
        {!isFetching && markers.length === 0 &&
          <h2>No events</h2>
        }
        {!isFetching && !world &&
          <h2>Mission World is not defined</h2>
        }
        {markers.length > 0 && world &&
          <div className="flex">
            <ArmaMap markers={markers} world={world} />
            <input
              type="range"
              min={time.start}
              max={time.end}
              value={time.current}
              onChange={this.seek.bind(this)}
            />
          </div>
        }
      </div>
    )
  }

  seek(event) {
    const newCurrentTime = parseInt(event.target.value, 10);
    seekEvents(newCurrentTime);
  }
}

Mission.propTypes = {
  markers: PropTypes.array.isRequired,
  time: PropTypes.object,
  world: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state, ownProps) {
  const { events, missions } = state
  const {
    isFetching,
    markers,
    time,
  } = events || {
    isFetching: true,
    markers: [],
    time: null,
  }

  let world = null;
  if (state.missions.missionsById && state.missions.missionsById[ownProps.params.id]) {
    const mission = state.missions.missionsById[ownProps.params.id];
    world = worlds[mission.world.toLowerCase()];
  }

  return {
    isFetching,
    markers,
    time,
    world,
  }
}

export default connect(mapStateToProps)(Mission)
