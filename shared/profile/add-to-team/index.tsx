import * as Constants from '../../constants/teams'
import * as Kb from '../../common-adapters'
import * as React from 'react'
import * as Styles from '../../styles'
import type * as Types from '../../constants/types/teams'
import {FloatingRolePicker} from '../../teams/role-picker'
import {InlineDropdown} from '../../common-adapters/dropdown'

type RowProps = {
  canAddThem: boolean
  checked: boolean
  disabledReason: string
  name: Types.Teamname
  isOpen: boolean
  onCheck: (selected: boolean) => void
  them: string
}

type RolePickerProps = {
  footerComponent: React.ReactNode
  isRolePickerOpen: boolean
  onCancelRolePicker: () => void
  onConfirmRolePicker: (role: Types.TeamRoleType) => void
  onOpenRolePicker: () => void
  selectedRole: Types.TeamRoleType
  disabledReasonsForRolePicker: {[K in Types.TeamRoleType]?: string}
}

// This state is handled by the state wrapper in the container
export type ComponentState = {
  selectedTeams: Set<string>
  onSave: () => void
  onToggle: (teamName: string, selected: boolean) => void
}

export type AddToTeamProps = {
  title: string
  addUserToTeamsResults: string
  addUserToTeamsState: Types.AddUserToTeamsState
  loadTeamList: () => void
  onBack: () => void
  teamProfileAddList: Array<Types.TeamProfileAddList>
  them: string
  waiting: boolean
}

type Props = {} & AddToTeamProps & RolePickerProps & ComponentState

const TeamRow = (props: RowProps) => (
  <Kb.ClickableBox onClick={props.canAddThem ? () => props.onCheck(!props.checked) : undefined}>
    <Kb.Box2 direction="horizontal" style={styles.teamRow}>
      <Kb.Checkbox disabled={!props.canAddThem} checked={props.checked} onCheck={props.onCheck} />
      <Kb.Box2 direction="vertical" style={{display: 'flex', position: 'relative'}}>
        <Kb.Avatar
          isTeam={true}
          size={Styles.isMobile ? 48 : 32}
          style={{marginRight: Styles.globalMargins.tiny}}
          teamname={props.name}
        />
      </Kb.Box2>
      <Kb.Box2 direction="vertical">
        <Kb.Box2 direction="horizontal" style={{alignSelf: 'flex-start'}}>
          <Kb.Text
            style={{color: props.canAddThem ? Styles.globalColors.black : Styles.globalColors.black_50}}
            type="BodySemibold"
          >
            {props.name}
          </Kb.Text>
          {props.isOpen && (
            <Kb.Meta title="open" style={styles.meta} backgroundColor={Styles.globalColors.green} />
          )}
        </Kb.Box2>
        <Kb.Box2 direction="horizontal" style={{alignSelf: 'flex-start'}}>
          <Kb.Text type="BodySmall">{props.disabledReason}</Kb.Text>
        </Kb.Box2>
      </Kb.Box2>
    </Kb.Box2>
    {!Styles.isMobile && <Kb.Divider style={styles.divider} />}
  </Kb.ClickableBox>
)

class AddToTeam extends React.Component<Props> {
  static navigationOptions = () => ({
    modal2: true,
    modal2ClearCover: false,
    modal2Style: styles.modal2,
    modal2Type: 'DefaultFullHeight',
  })
  componentDidUpdate(prevProps: Props) {
    if (prevProps.addUserToTeamsState !== 'succeeded' && this.props.addUserToTeamsState === 'succeeded') {
      // If we succeeded, close the modal
      this.props.onBack()
    } else if (prevProps.addUserToTeamsState !== 'failed' && this.props.addUserToTeamsState === 'failed') {
      // If we failed, reload the team list -- some teams might have succeeded
      // and should be updated.
      this.props.loadTeamList()
    }
  }

  private modal2Props = () => {
    const selectedTeamCount = this.props.selectedTeams.size
    return {
      footer: {
        content: (
          <Kb.ButtonBar fullWidth={true} style={styles.buttonBar}>
            {!Styles.isMobile && <Kb.Button type="Dim" onClick={this.props.onBack} label="Cancel" />}
            <Kb.WaitingButton
              disabled={selectedTeamCount === 0}
              fullWidth={Styles.isMobile}
              style={styles.addButton}
              onClick={this.props.onSave}
              label={selectedTeamCount <= 1 ? 'Add to team' : `Add to ${selectedTeamCount} teams`}
              waitingKey={Constants.addUserToTeamsWaitingKey(this.props.them)}
            />
          </Kb.ButtonBar>
        ),
      },
      ...(Styles.isMobile
        ? {
            header: {
              leftButton: Styles.isMobile ? (
                <Kb.Text type="BodyBigLink" onClick={this.props.onBack}>
                  Cancel
                </Kb.Text>
              ) : undefined,
            },
          }
        : {}),
    }
  }

  render() {
    return (
      <Kb.Modal2 {...this.modal2Props()}>
        <Kb.Box2 direction="vertical" style={styles.container} gap="xsmall" gapStart={true}>
          {this.props.addUserToTeamsState === 'failed' && (
            <Kb.Box2
              direction="horizontal"
              fullWidth={true}
              noShrink={true}
              style={styles.addUserToTeamsResultsBox}
            >
              <Kb.Text style={styles.addUserToTeamsResultsText} type="BodySemibold" negative={true}>
                {this.props.addUserToTeamsResults}
              </Kb.Text>
            </Kb.Box2>
          )}
          <Kb.Box2 direction="horizontal">
            <Kb.Text type="Header">Add</Kb.Text>
            <Kb.Avatar
              isTeam={false}
              size={16}
              style={{
                marginLeft: Styles.isMobile ? Styles.globalMargins.xxtiny : Styles.globalMargins.tiny,
                marginRight: Styles.globalMargins.tiny,
              }}
              username={this.props.them}
            />
            <Kb.Text type="Header">{this.props.them} to...</Kb.Text>
          </Kb.Box2>
          <Kb.BoxGrow style={{width: '100%'}}>
            <Kb.ScrollView style={{height: '100%', width: '100%'}}>
              <Kb.Box2 direction="vertical" style={{flexShrink: 1, width: '100%'}}>
                {!this.props.waiting ? (
                  this.props.teamProfileAddList.length > 0 ? (
                    this.props.teamProfileAddList.map(team => (
                      <TeamRow
                        canAddThem={!team.disabledReason}
                        checked={this.props.selectedTeams.has(team.teamName)}
                        disabledReason={team.disabledReason}
                        key={team.teamName}
                        name={team.teamName}
                        isOpen={team.open}
                        onCheck={selected => this.props.onToggle(team.teamName, selected)}
                        them={this.props.them}
                      />
                    ))
                  ) : (
                    <Kb.Box2 direction="vertical" centerChildren={true}>
                      <Kb.Text center={true} type="Body">
                        Looks like you haven't joined any teams yet yourself!
                      </Kb.Text>
                      <Kb.Text center={true} type="Body">
                        You can join teams over in the Teams tab.
                      </Kb.Text>
                    </Kb.Box2>
                  )
                ) : (
                  <Kb.Box2 direction="vertical" centerChildren={true}>
                    <Kb.ProgressIndicator style={{width: 64}} />
                  </Kb.Box2>
                )}
              </Kb.Box2>
            </Kb.ScrollView>
          </Kb.BoxGrow>
          <Kb.Box2 direction="horizontal" style={styles.addToTeam}>
            <Kb.Text style={styles.addToTeamTitle} type="BodySmall">
              {this.props.them} will be added as a
            </Kb.Text>
            <FloatingRolePicker
              presetRole={this.props.selectedRole}
              floatingContainerStyle={styles.floatingRolePicker}
              footerComponent={this.props.footerComponent}
              onConfirm={this.props.onConfirmRolePicker}
              onCancel={this.props.onCancelRolePicker}
              position="top center"
              open={this.props.isRolePickerOpen}
              disabledRoles={this.props.disabledReasonsForRolePicker}
            >
              <InlineDropdown
                textWrapperType="BodySmall"
                label={this.props.selectedRole}
                onPress={this.props.onOpenRolePicker}
              />
            </FloatingRolePicker>
          </Kb.Box2>
        </Kb.Box2>
      </Kb.Modal2>
    )
  }
}

const styles = Styles.styleSheetCreate(
  () =>
    ({
      addButton: Styles.platformStyles({
        isMobile: {width: '100%'},
      }),
      addToTeam: Styles.platformStyles({
        common: {
          alignItems: 'center',
          flexShrink: 0,
          flexWrap: 'wrap',
          marginBottom: Styles.globalMargins.small,
          marginLeft: Styles.globalMargins.small,
          marginRight: Styles.globalMargins.small,
        },
        isElectron: {marginTop: Styles.globalMargins.small},
      }),
      addToTeamTitle: Styles.platformStyles({
        common: {marginRight: Styles.globalMargins.tiny},
        isMobile: {
          marginBottom: Styles.globalMargins.tiny,
          marginTop: Styles.globalMargins.tiny,
        },
      }),
      addUserToTeamsResultsBox: {
        backgroundColor: Styles.globalColors.red,
        marginBottom: Styles.globalMargins.small,
      },
      addUserToTeamsResultsText: {
        margin: Styles.globalMargins.tiny,
        textAlign: 'center',
        width: '100%',
      },
      buttonBar: Styles.platformStyles({
        isMobile: {
          paddingLeft: Styles.globalMargins.xsmall,
          paddingRight: Styles.globalMargins.xsmall,
        },
      }),
      container: Styles.platformStyles({
        common: {
          alignItems: 'center',
          backgroundColor: Styles.globalColors.white,
          flexGrow: 1,
          width: '100%',
        },
        isElectron: {maxHeight: '100%'},
      }),
      divider: {marginLeft: 69},
      floatingRolePicker: Styles.platformStyles({
        isElectron: {
          bottom: -32,
          position: 'relative',
        },
      }),
      meta: {
        alignSelf: 'center',
        marginLeft: Styles.globalMargins.xtiny,
        marginTop: 2,
      },
      modal2: {width: Styles.isMobile ? undefined : 500},
      teamRow: Styles.platformStyles({
        common: {
          alignItems: 'center',
          paddingBottom: Styles.globalMargins.tiny,
          paddingTop: Styles.globalMargins.tiny,
          width: '100%',
        },
        isElectron: {
          minHeight: 48,
          paddingLeft: Styles.globalMargins.tiny,
        },
        isMobile: {
          minHeight: 64,
          paddingLeft: Styles.globalMargins.xsmall,
          paddingRight: Styles.globalMargins.tiny,
        },
      }),
      wrapper: Styles.platformStyles({
        common: {},
        isElectron: {maxHeight: '80%'},
        isMobile: {flexGrow: 1},
      }),
    } as const)
)

export default AddToTeam
