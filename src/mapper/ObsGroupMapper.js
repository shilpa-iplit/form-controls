import { createObsFromControl } from 'src/helpers/Obs';
import isEmpty from 'lodash/isEmpty';
import MapperStore from 'src/helpers/MapperStore';
import { cloneDeep } from 'lodash';
import ObservationMapper from "../helpers/ObservationMapper";

export class ObsGroupMapper {

  getInitialObject(formName, formVersion, control, bahmniObservations) {
    const obsGroups = createObsFromControl(formName, formVersion, control, bahmniObservations);
    return obsGroups.map(obsGroup => {
      if (obsGroup.groupMembers !== undefined) {
        let groupMembers = [];
        for (const ctrl of control.controls) {
          const mapper = MapperStore.getMapper(ctrl);
          groupMembers = groupMembers.concat(mapper.getInitialObject(formName, formVersion,
            ctrl, obsGroup.groupMembers));
        }
        obsGroup.groupMembers = groupMembers;
      }
      return obsGroup;
    });
  }

  setValue(obsGroup, obs) {
    let updatedObsGroup = obsGroup.addGroupMember(obs);

    const filteredMembers = this.areAllChildObsVoided(updatedObsGroup.getGroupMembers());
    const voided = updatedObsGroup.getGroupMembers().every((groupMember) => groupMember.isVoided());

    if (filteredMembers.size === 0 || voided) {
      updatedObsGroup = updatedObsGroup.setValue(undefined).void();
    } else {
      updatedObsGroup = updatedObsGroup.setValue(obs.value).set('voided', false);
    }

    return updatedObsGroup;
  }

  areAllChildObsVoided(observations) {
    return observations.filter((obs) => {
      if (!isEmpty(obs.groupMembers)) {
        return this.areAllChildObsVoided(obs.groupMembers);
      }
      return !obs.voided;
    });
  }

  getObject(obsGroup) {
    return obsGroup.getObject(obsGroup);
  }

  getValue(){
    return undefined;
  }

  getData(record){
    let obsGroup = cloneDeep(record.dataSource);
    if (obsGroup.formFieldPath != record.formFieldPath) {
      obsGroup.uuid = undefined;
      obsGroup.formFieldPath = record.formFieldPath;
    }
    obsGroup.groupMembers = (new ObservationMapper()).from(record);
    obsGroup.voided = false;

    return obsGroup;
  }

  getChildren(obs){
    return obs.groupMembers;
  }
}
