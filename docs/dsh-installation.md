# PPT Master for Model Router / DeepSeek Harness

`@ljwei-stak/ppt-master-for-mgr` 6.3.2 packages the upstream PPT Master 6.3.0
workflow with a native DSH host adapter. The distribution version is owned by
`package.json`; the upstream skill and Claude marketplace metadata retain
their upstream version and attribution. GitHub tag/Release `v6.3.2` and npm
publish the same distribution.

Version 6.3.2 fixes PPTX export on Windows with Python 3.13+ under the DSH
workspace sandbox. Assembly directories now inherit the writable parent ACL;
POSIX directories retain private permissions.

## Features

- Generate editable PowerPoint decks from a topic, documents, or source material.
- Reuse Brand/Style/Layout/Deck workspaces and fill or edit native PPTX files.
- Run the upstream source conversion, SVG checking, and native DrawingML export tools.
- Add notes, animation, and narration when the selected workflow and installed tools support them.
- Discover and load `ppt-master` through the native DSH `skill` tool in a Model Router conversation.

The adapter does not contain an LLM or an image provider. Model Router chooses
the conversation model; image generation, web access, and optional audio/video
tools use their own configured providers. The upstream Image to PPTX
reconstruction profile supports Codex only and is unavailable in DSH.

## Install

Use DSH 0.1.2-rc.1 or newer with its native skill registry, filesystem skill
provider, and `skill` tool. Use Node.js 22.19+ and Python 3.10+.

In DSH's plugin management, install or update this package:

```text
@ljwei-stak/model-router-galgame@0.4.23
```

Router 0.4.23 installs this PPT package and inserts its host plugin in the same
profile. If Router is already managed separately, the standalone plugin is:

```text
@ljwei-stak/ppt-master-for-mgr@6.3.2
```

Apply the package's `cordis.patch.yml` through DSH's bundle installation flow,
then enable/reload the profile. `npm install` alone downloads files but does
not apply the DSH profile configuration. Manual profile administrators can
install with `npm install @ljwei-stak/ppt-master-for-mgr@6.3.2`, then merge the
bundled patch. Use only one `ppt-master-for-mgr` entry per profile.

## Prepare Python

Run these commands in the same environment that the DSH shell uses:

```sh
npx --yes --package=@ljwei-stak/ppt-master-for-mgr@6.3.2 ppt-master-for-mgr doctor
npx --yes --package=@ljwei-stak/ppt-master-for-mgr@6.3.2 ppt-master-for-mgr setup
npx --yes --package=@ljwei-stak/ppt-master-for-mgr@6.3.2 ppt-master-for-mgr doctor
```

`setup` explicitly runs `python -m pip install -r` against the bundled
requirements. It needs package-index access. An activated virtual environment
is recommended. Pass `--python <absolute-interpreter-path>` to both commands
to select one explicitly. Set `PPT_MASTER_PYTHON` to the same executable in
the DSH shell environment when using a non-default interpreter. The plugin
does not modify system Python or execute `setup` during npm installation.

`doctor` checks Python and core PPTX imports; it does not test credentials,
optional tools, remote image/audio services, or model quality. FFmpeg, Pandoc,
and other optional tools are needed only for workflows that require them.

## Use in Model Router

Enable the native `skill`, file reading/writing, and shell tools in the active
DSH agent preset. A PPT request should cause the model to call
`skill(name="ppt-master")` before following the workflow. For example:

> Use ppt-master to create an editable 8-slide quarterly review from the attached report.

The ordinary workflow confirms its plan before authoring. An explicit quick
generation request uses the upstream Quick workflow. Source files and output
projects stay in the user's DSH workspace; scripts and bundled templates are
read from the absolute installed skill directory. Host approvals still apply
to file, shell, network, and browser operations.

## Troubleshooting and Releases

- No `ppt-master` in the skill catalog: check that the plugin loaded, native
  skill services are present, and the current preset exposes the `skill` tool.
- Python import error: run `doctor` and `setup` with the same interpreter used
  by the DSH shell. Installing into another Python environment does not help.
- Permission error creating a project: use an absolute writable workspace
  and `project_manager.py init <name> --dir <workspace>/projects`.
- Missing image or narration access: configure the provider required by that
  workflow; npm installation does not include provider credentials.

Releases are synchronized on request. Compare npm's published version and
GitHub's `package.json` semantically, never downgrade or overwrite an existing
npm version/tag, and publish changed package contents under a new version.
Each release includes a GitHub Release and the npm tarball. There is no
scheduled background synchronizer.

PPT Master is copyright (c) 2025-2026 Hugo He, MIT licensed. This fork adds the
DSH/Model Router adapter and preserves the upstream license and attribution.
