import { Switch } from '@chakra-ui/react';

import TimeInput from '../../../../common/components/input/time-input/TimeInput';
import { useEditorSettings } from '../../../../common/stores/editorSettings';
import { forgivingStringToMillis } from '../../../../common/utils/dateConfig';
import * as Panel from '../PanelUtils';

export default function EditorSettingsForm() {
  const eventSettings = useEditorSettings((state) => state.eventSettings);
  const setShowQuickEntry = useEditorSettings((state) => state.setShowQuickEntry);
  const setLinkPrevious = useEditorSettings((state) => state.setLinkPrevious);
  const setDefaultPublic = useEditorSettings((state) => state.setDefaultPublic);
  const setDefaultDuration = useEditorSettings((state) => state.setDefaultDuration);

  const durationInMs = forgivingStringToMillis(eventSettings.defaultDuration);

  return (
    <Panel.Section>
      <Panel.Card>
        <Panel.SubHeader>Editor settings</Panel.SubHeader>
        <Panel.Divider />
        <Panel.ListGroup>
          <Panel.ListItem>
            <Panel.Field
              title='Show quick entry'
              description='Whether the quick entry buttons show under selected event'
            />
            <Switch
              variant='ontime'
              size='lg'
              defaultChecked={eventSettings.showQuickEntry}
              onChange={(event) => setShowQuickEntry(event.target.checked)}
            />
          </Panel.ListItem>
          <Panel.ListItem>
            <Panel.Field
              title='Link previous'
              description='New events start time will be linked to the previous event'
            />
            <Switch
              variant='ontime'
              size='lg'
              defaultChecked={eventSettings.linkPrevious}
              onChange={(event) => setLinkPrevious(event.target.checked)}
            />
          </Panel.ListItem>
          <Panel.ListItem>
            <Panel.Field
              title='Default duration'
              description='When creating a new event, what is the default duration'
            />
            <TimeInput<'defaultDuration'>
              name='defaultDuration'
              submitHandler={(_field, value) => setDefaultDuration(value)}
              time={durationInMs}
              placeholder='00:10:00'
            />
          </Panel.ListItem>
          <Panel.ListItem>
            <Panel.Field title='Default public' description='New events will be public' />
            <Switch
              variant='ontime'
              size='lg'
              defaultChecked={eventSettings.defaultPublic}
              onChange={(event) => setDefaultPublic(event.target.checked)}
            />
          </Panel.ListItem>
        </Panel.ListGroup>
      </Panel.Card>
    </Panel.Section>
  );
}
