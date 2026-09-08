# DeepSeek Harness Runtime

This integration registers `ppt-master` with the native DSH skill registry.
The agent must have the native `skill`, file reading/writing, and shell tools
enabled. Model Router preserves that skill catalog and the loaded workflow
while selecting a provider and model. Use the native tools and the host's
ordinary permission and approval flow for all operations.

Use the absolute directory returned by the native `skill` tool as `SKILL_DIR`.
The npm package may be installed in a read-only or shared directory. Read its
scripts, templates, and references in place; create projects in the user's
writable DSH workspace. Always pass `--dir "<absolute-workspace>/projects"`
to `project_manager.py init`, and retain the absolute path it returns. Do not
write generated projects, dependency environments, credentials, or user
configuration into the installed skill directory.

The DSH shell needs Python 3.10+ and the dependencies in
`${SKILL_DIR}/requirements.txt`. Use the interpreter selected for that shell
(including an activated virtual environment or `PPT_MASTER_PYTHON`) in place
of the documented `python3`. If dependencies are missing, report the failed
command and the explicit setup command from the installation guide. Do not
install Python packages merely because the plugin was loaded.

Read every selected role's reference before executing that role. Role names
describe workflow responsibilities; the current agent may perform them
sequentially. Delegate only when the host supplies an appropriate agent tool,
and preserve every selected workflow gate. Use only image/search/browser
capabilities actually available in the host. The Image to PPTX profile is
upstream Codex-only and is not supported by this DSH adapter.
