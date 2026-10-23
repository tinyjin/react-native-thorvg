import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function RunExamples() {
  const { siteConfig } = useDocusaurusContext();
  const repository = String(siteConfig.customFields?.repository);
  const name = repository.split('/').pop();

  return (
    <>
      <p>
        The sources are in{' '}
        <a href={`${repository}/tree/main/example/src/examples`}>
          <code>example/src/examples</code>
        </a>
        . To run them on a device:
      </p>
      <CodeBlock language="sh">
        {[
          `git clone --recursive ${repository}.git`,
          `cd ${name}`,
          'yarn',
          'yarn build:thorvg',
          'yarn example ios     # or: yarn example android, yarn example web',
        ].join('\n')}
      </CodeBlock>
    </>
  );
}
