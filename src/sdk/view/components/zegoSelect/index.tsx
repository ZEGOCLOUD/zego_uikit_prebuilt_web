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
  listRef = React.createRef<HTMLDivElement>();
  selectRef = React.createRef<HTMLDivElement>();
  handleChange(op: { value: string; name: string }): void {
    if (this.state.value === op.value) return;
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
  onCloseList = (event: any) => {
    if (
      this.listRef.current === event.target ||
      this.listRef.current?.contains(event.target as Node) ||
      this.selectRef.current === event.target ||
      this.selectRef.current?.contains(event.target as Node)
    ) {
    } else {
      this.setState({
        showList: false,
      });
    }
  };
  setInitValue() {
    if (this.props.options?.length) {
      if (this.props.initValue) {
        const option = this.props.options.filter(
          (op) => op.value === this.props.initValue
        );
        this.setState({
          ...option[0],
        });
      } else {
        this.setState({ ...this.props.options[0] });
      }
    }
  }
  componentDidMount() {
    this.setInitValue();
    // 点击其他区域时, 隐藏指定区域(cDom)
    document.addEventListener("click", this.onCloseList);
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.onCloseList);
  }
  componentDidUpdate(prevProps: any) {
    if (this.props.options?.length !== prevProps.options?.length) {
      this.setInitValue();
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
          ref={this.selectRef}
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
        <div
          ref={this.listRef}
          className={`${ZegoSelectCss.optionsWrapper} ${this.state.showList &&
            ZegoSelectCss.showList}`}
        >
          {this.props.options?.map((op) => (
            <div
              className={`${ZegoSelectCss.option} ${this.state.value ===
                op.value && ZegoSelectCss.optionSelected}`}
              onClick={() => {
                this.handleChange(op);
              }}
              key={op.value}
            >
              {op.name}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
