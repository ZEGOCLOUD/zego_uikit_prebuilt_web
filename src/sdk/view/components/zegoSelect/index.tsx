import React from "react";
import ZegoSelectCss from "./index.module.scss";
export interface ZegoSelectProps {
  label?: string;
  placeholder?: string;
  options?: Array<{
    name: string;
    value: string;
  }>;
  onChange?: Function;
  theme?: string;
  initValue?: string;
}
export class ZegoSelect extends React.Component<ZegoSelectProps> {
  state = {
    value: "",
    name: "",
    showList: false,
  };
  handleChange(op: { value: string; name: string }): void {
    this.setState({ ...op });
    this.props.onChange && this.props.onChange(op.value);
    this.setState({
      showList: false,
    });
  }
  handleClickInput() {
    if (this.props.options?.length) {
      this.setState({
        showList: !this.state.showList,
      });
    }
  }
  componentDidMount() {
    if (this.props.options?.length) {
      if (this.props.initValue) {
        const option = this.props.options.filter(
          (op) => op.value === this.props.initValue
        );
        this.setState({
          ...option,
        });
      } else {
        this.setState({ ...this.props.options[0] });
      }
    }
    // document.body.addEventListener(
    //   "click",
    //   () => {
    //     if (this.state.showList) {
    //       this.setState({
    //         showList: false,
    //       });
    //     }
    //   },
    //   { passive: true }
    // );
  }
  componentDidUpdate(prevProps: any) {
    if (this.props.options?.length !== prevProps.options?.length) {
      if (this.props.options?.length) {
        const { value, name } = this.props.options[0];
        this.setState({ value: value, name: name });
      }
    }
  }
  render(): React.ReactNode {
    return (
      <div
        className={`${ZegoSelectCss.selectWrapper} ${
          this.props.theme === "black"
            ? ZegoSelectCss.blackTheme
            : ZegoSelectCss.whiteTheme
        }`}
      >
        <label className={ZegoSelectCss.selectLabel}>{this.props.label}</label>
        <div
          className={`${ZegoSelectCss.selectInputWrapper} ${this.state
            .showList && ZegoSelectCss.inputActived}`}
          onClick={() => {
            this.handleClickInput();
          }}
        >
          <p className={!this.state.name ? ZegoSelectCss.noOptions : ""}>
            {this.state.name || this.props.placeholder}
          </p>
          <span></span>
        </div>
        <ul
          className={`${ZegoSelectCss.optionsWrapper} ${this.state.showList &&
            ZegoSelectCss.showList}`}
        >
          {this.props.options?.map((op) => (
            <li
              className={`${ZegoSelectCss.option} ${this.state.value ===
                op.value && ZegoSelectCss.optionSelected}`}
              onClick={() => {
                this.handleChange(op);
              }}
              key={op.value}
            >
              {op.name}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
