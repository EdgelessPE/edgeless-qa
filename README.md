# Edgeless QA (For Nep)

此 QA 可以通过 VboxManage 命令行控制 VirtualBox 虚拟机进行 nep 包的自动测试，并生成报告和 Meta 信息。

## 准备虚拟机

- 安装 VirtualBox，确保可以使用 VboxManage 命令
- 新建一个 Windows 虚拟机（推荐使用 Windows 10 LTSC），命名为 `NepTest`；若需要自定义名称请修改 `master/constants.ts` 中的 `VM_NAME` 变量值
- 完成 Windows OOBE 后进入桌面，安装 Git
- 克隆本仓库到桌面或任意位置：`git clone https://github.com/Cnotech/edgeless-qa.git`，运行 `yarn install` 命令安装依赖
- 若被测 ept 需要依赖，请在 `./ept` 目录中配置好（`msvcp140.dll` `vcruntime140.dll` `vcruntime140_1.dll`）
- 启动 `任务计划程序`，添加一条计划任务：登录时启动程序 `cmd /c "start /min work.cmd"`，起始位置为克隆的项目目录
- 安装 Windows 更新，关闭 UAC、Windows Defender、Windows SmartScreen 等，然后正确关闭虚拟机
- 为虚拟机创建备份 `base`；若需要自定义备份名称请修改 `master/constants.ts` 中的 `VM_SNAPSHOT` 变量值

## 准备测试案例

- 编译 ept，将得到的 release 版本二进制文件放置在 `./storage/ept.exe`
- 在 `storage` 目录中按目录分类放置 nep 包，示例：
  ```
  edgeless-qa/storage
  ├─即时通讯
  │      QQ_9.7.5.0_Bot.nep
  │      TIM_3.3.9.0_Bot.nep
  │      Wechat_3.9.0.0_Bot.nep
  │
  ├─安全急救
  ├─实用工具
  │      BBDown_1.5.4.0_Bot.nep
  │      bottom_0.8.0.0_Bot.nep
  │      Diffpdf_2.1.3.0_Bot.nep
  │      Nali_0.7.1.0_Bot.nep
  │
  ├─开发辅助
  │      adb_34.0.1.0_Bot.nep
  │
  ├─集成开发
  │      VSCode_1.76.2.0_Bot.nep
  │
  └─驱动管理
          360驱动大师_4.5.12.0_Bot.nep
          驱动总裁_2.12.0.0_Bot.nep
  ```

## 运行测试

在宿主机上运行 `yarn master` 以启动测试，报告存放在 `./reports`
